import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GENERIC_ERROR, UserFacingError, type Provider } from "./provider";

/**
 * Claude through the Anthropic SDK's tool runner. Works with Anthropic directly (ANTHROPIC_API_KEY)
 * or an Anthropic-compatible gateway (ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN, e.g. OpenCode).
 */
const MODEL = process.env.ASSISTANT_MODEL || "claude-opus-5-5";
const VIA_GATEWAY = !!process.env.ANTHROPIC_BASE_URL;

class TruncatedToolInput extends Error {}

export const claude: Provider = {
  name: "anthropic",

  async answer({ system, tools, messages, signal, onText, onTool }) {
    const client = new Anthropic();
    let runner = client.beta.messages.toolRunner(
      {
        model: MODEL,
        max_tokens: 16000,
        // Thinking is always on for this model; low effort keeps chat replies quick.
        output_config: { effort: "low" },
        // Directly on Anthropic: if a safety classifier declines, the API retries on a fallback model in the
        // same call. Gateways may not support this beta, so it is only sent to Anthropic itself.
        ...(VIA_GATEWAY ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }),
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        tools: tools.map((t) =>
          betaZodTool({ name: t.name, description: t.description, inputSchema: t.schema, run: t.run, eager_input_streaming: true }),
        ),
        messages,
        max_iterations: 6,
        // Send the full history each turn instead of keeping a server-side thread (nothing stored between turns).
        thread: false,
        stream: true,
      },
      { signal },
    );

    for (let attempt = 0; ; attempt++) {
      try {
        for await (const messageStream of runner) {
          for await (const event of messageStream) {
            if (event.type === "content_block_start" && event.content_block.type === "tool_use") onTool(event.content_block.name);
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") onText(event.delta.text);
          }
          const message = await messageStream.finalMessage();
          attempt = 0;
          const hasToolUse = message.content.some((b) => b.type === "tool_use");
          if (message.stop_reason === "max_tokens" && hasToolUse) throw new TruncatedToolInput();
          if (message.stop_reason === "refusal")
            throw new UserFacingError("I can't help with that one. Try asking about using LGU Connect or your figures.");
        }
        return;
      } catch (err) {
        // Re-issue only for unparseable tool input or a dropped connection.
        if (err instanceof Anthropic.APIError || err instanceof TruncatedToolInput || err instanceof UserFacingError || attempt >= 2 || signal.aborted)
          throw err;
        runner = client.beta.messages.toolRunner({ ...runner.params }, { signal });
      }
    }
  },

  explain(err) {
    if (err instanceof UserFacingError) return err.message;
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
      return "The assistant's AI service key is not valid. Ask your system administrator to check it.";
    if (err instanceof Anthropic.APIError && err.status === 402)
      return "The AI service has run out of credits. Ask your system administrator to top up the account.";
    if (err instanceof Anthropic.RateLimitError) return "The assistant is busy right now. Please try again in a minute.";
    if (err instanceof Anthropic.APIError && (err.status ?? 0) >= 500) return "The AI service is having trouble. Please try again shortly.";
    return GENERIC_ERROR;
  },
};
