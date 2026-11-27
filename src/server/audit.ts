import "server-only";
import type { AuditAction } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

type Tx = Prisma.TransactionClient | typeof db;

type Entry = {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  changes?: Record<string, [unknown, unknown]> | null;
};

/** Anyone who can act: a secretary session, or a staff actor (see actorOf in server/auth.ts). */
export type AuditCtx = {
  user: { id: string; name: string };
  barangay?: { code: string; municipalityCode: string } | null;
  municipality?: { code: string } | null;
};

/** Writes one line to the audit log. Call inside the same transaction as the change. */
export async function audit(session: AuditCtx, entry: Entry, tx: Tx = db) {
  await tx.auditLog.create({
    data: {
      actorId: session.user.id,
      actorName: session.user.name,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      summary: entry.summary,
      changes: entry.changes && Object.keys(entry.changes).length ? (entry.changes as Prisma.InputJsonValue) : undefined,
      barangayCode: session.barangay?.code ?? null,
      municipalityCode: session.barangay?.municipalityCode ?? session.municipality?.code ?? null,
    },
  });
}

const norm = (v: unknown): unknown => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (v && typeof v === "object" && "toNumber" in v) return Number(v);
  if (v === "" || v === undefined) return null;
  return v;
};

/** Only the fields that actually changed, as { field: [before, after] }. */
export function diff<T extends Record<string, unknown>>(before: T, after: Partial<T>) {
  const out: Record<string, [unknown, unknown]> = {};
  for (const key of Object.keys(after)) {
    const a = norm(before[key]);
    const b = norm(after[key]);
    if (JSON.stringify(a) !== JSON.stringify(b)) out[key] = [a, b];
  }
  return out;
}

/** Next running number for a barangay (resident, household, request, control numbers...). Atomic per key. */
export async function nextNumber(tx: Tx, barangayCode: string, key: string): Promise<number> {
  const row = await tx.counter.upsert({
    where: { barangayCode_key: { barangayCode, key } },
    create: { barangayCode, key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return row.value;
}

export const pad = (n: number, width = 4) => String(n).padStart(width, "0");
