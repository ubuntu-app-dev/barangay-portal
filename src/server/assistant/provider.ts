import "server-only";
import type { AssistantTool } from "./tools";

/** What the route hands to a provider for one answer. */
export type AnswerRequest = {
  system: string;
  tools: AssistantTool[];
  /** Plain text turns, oldest first, ending with the user's question. */
  messages: { role: "user" | "assistant"; content: string }[];
  signal: AbortSignal;
  /** Stream events to the widget: answer text, or a "looking something up" status line. */
  onText: (text: string) => void;
  onTool: (name: string) => void;
};

/** A message safe to show the user, mapped from a provider's error. */
export class UserFacingError extends Error {}

export type Provider = {
  /** Shown nowhere; used in server logs. */
  name: string;
  answer: (req: AnswerRequest) => Promise<void>;
  /** Turns a provider error into a message for the user. */
  explain: (err: unknown) => string;
};

export const GENERIC_ERROR = "Something went wrong while answering. Please try again.";

/** Runs a tool with schema validation; invalid input becomes an error string the model can correct. */
export async function runTool(tools: AssistantTool[], name: string, input: unknown) {
  const t = tools.find((x) => x.name === name);
  if (!t) return { ok: false, output: `Unknown tool ${name}.` };
  const parsed = t.schema.safeParse(input ?? {});
  if (!parsed.success) return { ok: false, output: `Invalid input for ${name}: ${parsed.error.issues.map((i) => i.message).join("; ")}` };
  try {
    return { ok: true, output: await t.run(parsed.data) };
  } catch (err) {
    console.error(`[assistant] tool ${name}`, err instanceof Error ? err.message : err);
    return { ok: false, output: `The ${name} lookup failed. Tell the user to try again later.` };
  }
}
