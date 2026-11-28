import { z } from "zod";
import { actorOf, getAuthUser } from "@/server/auth";
import { hit, tooMany } from "@/server/rate-limit";
import { claude } from "@/server/assistant/claude";
import { gemini } from "@/server/assistant/gemini";
import { systemPrompt, WORKSPACE_OF } from "@/server/assistant/prompt";
import type { Provider } from "@/server/assistant/provider";
import { assistantTools } from "@/server/assistant/tools";

/**
 * The in-app AI assistant. Streams newline-delimited JSON events to the chat widget:
 *   {"t":"text","v":"..."}   part of the answer
 *   {"t":"tool","v":"..."}   the assistant is looking something up (shown as a status line)
 *   {"t":"error","v":"..."}  a message to show instead of an answer
 *   {"t":"done"}
 * Only signed-in users can call it, and its tools read only within that user's scope.
 *
 * Provider: ASSISTANT_PROVIDER = "gemini" or "anthropic". When unset, Gemini is used if GEMINI_API_KEY
 * is set, otherwise Claude (ANTHROPIC_API_KEY, or ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN).
 */
function pickProvider(): Provider | null {
  const choice = process.env.ASSISTANT_PROVIDER?.toLowerCase();
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasClaude = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  if (choice === "gemini") return hasGemini ? gemini : null;
  if (choice === "anthropic" || choice === "claude") return hasClaude ? claude : null;
  return hasGemini ? gemini : hasClaude ? claude : null;
}

/** Per user, per server instance. The provider's spend or quota limit is the hard ceiling. */
const LIMIT = 20;
const WINDOW = 10 * 60_000;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(20)
    .refine((m) => m[0].role === "user" && m[m.length - 1].role === "user", "Conversation must start and end with the user."),
});

const TOOL_STATUS: Record<string, string> = {
  search_help: "Searching the help guides…",
  get_statistics: "Counting your records…",
  get_work_status: "Checking what needs attention…",
};

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });
  const provider = pickProvider();
  if (!provider)
    return Response.json({ error: "The assistant is not set up yet. Ask your system administrator to add the AI service key." }, { status: 503 });

  const key = `assistant:${user.id}`;
  if (tooMany(key, LIMIT, WINDOW)) return Response.json({ error: "You've asked a lot of questions in a short time. Please wait a few minutes." }, { status: 429 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "That message could not be sent. Try a shorter question." }, { status: 400 });
  hit(key);

  const ws = WORKSPACE_OF[user.role];
  const session = { ...user, actor: actorOf(user) };
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: Record<string, string>) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await provider.answer({
          system: systemPrompt(session, ws),
          tools: assistantTools(session, ws),
          messages: parsed.data.messages,
          signal: request.signal,
          onText: (v) => send({ t: "text", v }),
          onTool: (name) => send({ t: "tool", v: TOOL_STATUS[name] ?? "Looking that up…" }),
        });
      } catch (err) {
        if (request.signal.aborted) return controller.close();
        console.error(`[assistant:${provider.name}]`, err instanceof Error ? err.message : err);
        send({ t: "error", v: provider.explain(err) });
      }
      send({ t: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
