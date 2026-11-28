import "server-only";
import { ApiError, FinishReason, GoogleGenAI, type Content, type FunctionCall, type Part } from "@google/genai";
import { z } from "zod/v4";
import { GENERIC_ERROR, runTool, UserFacingError, type Provider } from "./provider";

/**
 * Gemini through Google's @google/genai SDK (Google AI Studio key in GEMINI_API_KEY).
 * The tool loop is written out here: the model asks for tools, we run them (validated against the
 * same schemas as the Claude path), send the results back, and repeat until it answers.
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
/** Tried in order when a model is overloaded, unavailable (404), out of quota (429), or too slow. */
const FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.1-flash-lite,gemini-flash-lite-latest")
  .split(",")
  .map((m) => m.trim())
  .filter((m) => m && m !== MODEL);
const MAX_ROUNDS = 6;
/** A single model call that takes longer than this is abandoned. */
const ROUND_TIMEOUT_MS = 25_000;
const RETRYABLE = new Set([404, 429, 500, 503, 504]);

/** Zod schema → JSON Schema for a function declaration (the $schema marker is not needed). */
function jsonSchema(schema: z.ZodType) {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  void _ignored;
  return rest;
}

export const gemini: Provider = {
  name: "gemini",

  async answer({ system, tools, messages, signal, onText, onTool }) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const functionDeclarations = tools.map((t) => ({ name: t.name, description: t.description, parametersJsonSchema: jsonSchema(t.schema) }));
    const contents: Content[] = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

    const models = [MODEL, ...FALLBACKS];
    let m = 0; // stays on a fallback once switched, for the rest of this answer

    for (let round = 0; round < MAX_ROUNDS; round++) {
      // Keep every part the model sent (including thought signatures) so the next round continues correctly.
      let parts: Part[] = [];
      let calls: FunctionCall[] = [];
      // One model call. If a model is overloaded, unavailable, or silent for too long BEFORE it has shown
      // the user anything, the same round is retried on the next model in the list.
      for (;;) {
        parts = [];
        calls = [];
        let shown = false;
        try {
          const stream = await ai.models.generateContentStream({
            model: models[m],
            contents,
            config: {
              systemInstruction: system,
              tools: [{ functionDeclarations }],
              maxOutputTokens: 8192,
              abortSignal: AbortSignal.any([signal, AbortSignal.timeout(ROUND_TIMEOUT_MS)]),
            },
          });
          for await (const chunk of stream) {
            const candidate = chunk.candidates?.[0];
            for (const p of candidate?.content?.parts ?? []) {
              parts.push(p);
              if (p.functionCall) {
                calls.push(p.functionCall);
                onTool(p.functionCall.name ?? "");
              } else if (p.text && !p.thought) {
                shown = true;
                onText(p.text);
              }
            }
            const reason = candidate?.finishReason;
            if (reason === FinishReason.SAFETY || reason === FinishReason.PROHIBITED_CONTENT || reason === FinishReason.BLOCKLIST)
              throw new UserFacingError("I can't help with that one. Try asking about using LGU Connect or your figures.");
          }
          break;
        } catch (err) {
          const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError") && !signal.aborted;
          const retryable = timedOut || (err instanceof ApiError && RETRYABLE.has(err.status));
          if (retryable && !shown && m < models.length - 1 && !signal.aborted) {
            console.warn(`[assistant:gemini] ${models[m]} ${timedOut ? "timed out" : `returned ${(err as ApiError).status}`}; trying ${models[m + 1]}`);
            m++;
            continue;
          }
          throw err;
        }
      }

      if (calls.length === 0) return;
      contents.push({ role: "model", parts });
      const results = await Promise.all(calls.map((c) => runTool(tools, c.name ?? "", c.args)));
      contents.push({
        role: "user",
        parts: calls.map((c, i) => ({
          functionResponse: { id: c.id, name: c.name, response: results[i].ok ? { output: results[i].output } : { error: results[i].output } },
        })),
      });
    }
    onText("\n\nI needed too many lookups for that one. Try asking a more specific question.");
  },

  explain(err) {
    if (err instanceof UserFacingError) return err.message;
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) return "The AI service took too long to answer. Please try again.";
    if (err instanceof ApiError) {
      if (err.status === 400 && /api key/i.test(err.message)) return "The assistant's AI service key is not valid. Ask your system administrator to check it.";
      if (err.status === 401 || err.status === 403) return "The assistant's AI service key is not valid. Ask your system administrator to check it.";
      if (err.status === 429) return "The assistant has reached its usage limit for now. Please try again in a few minutes.";
      if (err.status === 503) return "The AI service is very busy right now. Please try again in a minute.";
      if (err.status >= 500) return "The AI service is having trouble. Please try again shortly.";
    }
    return GENERIC_ERROR;
  },
};
