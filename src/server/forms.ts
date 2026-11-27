import "server-only";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";

/**
 * FormData → plain object. Empty strings become undefined so optional fields validate cleanly;
 * checkboxes arrive as "on" (checked) or are missing (unchecked).
 */
export function formObject(fd: FormData) {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    out[k] = t === "" ? undefined : t;
  }
  return out;
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; state: ActionState };

export function parse<S extends z.ZodType>(schema: S, fd: FormData): Parsed<z.infer<S>> {
  const result = schema.safeParse(formObject(fd));
  if (result.success) return { ok: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, state: { ok: false, message: "Please check the highlighted fields.", errors, at: Date.now() } };
}

export const ok = (message: string): ActionState => ({ ok: true, message, at: Date.now() });
export const fail = (message: string, errors?: Record<string, string>): ActionState => ({ ok: false, message, errors, at: Date.now() });

// Reusable field schemas with friendly messages.
export const req = (label: string, max = 200) =>
  z.string({ error: `${label} is required.` }).min(1, `${label} is required.`).max(max, `${label} is too long.`);
export const opt = (max = 500) => z.string().max(max, "This is too long.").optional();
export const bool = z.preprocess((v) => v === "on" || v === "true", z.boolean());
export const date = (label: string) =>
  z
    .string({ error: `${label} is required.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Enter a valid ${label.toLowerCase()}.`)
    .transform((s) => new Date(`${s}T00:00:00Z`));
export const optDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .transform((s) => new Date(`${s}T00:00:00Z`))
  .optional();
export const dateTime = (label: string) =>
  z
    .string({ error: `${label} is required.` })
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, `Enter a valid ${label.toLowerCase()}.`)
    .transform((s) => new Date(`${s}:00+08:00`));
export const int = (label: string, min = 0, max = 1_000_000) =>
  z.coerce.number({ error: `${label} must be a number.` }).int(`${label} must be a whole number.`).min(min, `${label} must be at least ${min}.`).max(max, `${label} is too large.`);
export const optInt = (min = 0, max = 1_000_000) => z.coerce.number({ error: "Enter a number." }).int("Enter a whole number.").min(min).max(max).optional();
export const money = z.coerce.number({ error: "Enter an amount." }).min(0, "Amount cannot be negative.").max(100_000_000);
export const optMoney = z.coerce.number({ error: "Enter an amount." }).min(0, "Amount cannot be negative.").max(100_000_000).optional();
export const phone = z
  .string()
  .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number.")
  .optional();
export const email = z.email("Enter a valid email address.").max(200).optional();
/** A Prisma enum object (e.g. Sex) → zod enum with a friendly message. Output is typed as the Prisma enum. */
export const enumOf = <const T extends Record<string, string>>(e: T, label: string) => z.enum(e, { error: `Choose a ${label.toLowerCase()}.` });
