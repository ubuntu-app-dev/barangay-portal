"use server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { RequestChannel } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { nameFull } from "@/lib/dashboard/format";
import { audit, nextNumber, pad } from "@/server/audit";
import { db } from "@/server/db";
import { bool, enumOf, fail, ok, opt, optInt, parse, req } from "@/server/forms";
import { getSignatory } from "@/server/queries/documents";
import { ageOn, phYear } from "@/server/time";
import { authorize, refreshDashboard } from "./shared";

// ───────── Requests ─────────

export async function createRequest(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("documents:issue");
  const p = parse(z.object({ residentId: req("Resident", 40), documentTypeId: req("Document", 40), purpose: req("Purpose", 200), channel: enumOf(RequestChannel, "Channel"), remarks: opt(500) }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const [r, t] = await Promise.all([
    db.resident.findFirst({ where: { id: v.residentId, barangayCode: code, deletedAt: null, status: "ACTIVE" } }),
    db.documentType.findFirst({ where: { id: v.documentTypeId, barangayCode: code, isActive: true } }),
  ]);
  if (!r) return fail("Choose an active resident.", { residentId: "Choose a resident." });
  if (!t) return fail("Choose a document.", { documentTypeId: "Choose a document." });
  const req2 = await db.$transaction(async (tx) => {
    const year = phYear();
    const n = await nextNumber(tx, code, `request:${year}`);
    const q = await tx.documentRequest.create({ data: { barangayCode: code, requestNo: `REQ-${year}-${pad(n)}`, residentId: r.id, documentTypeId: t.id, purpose: v.purpose, channel: v.channel, remarks: v.remarks ?? null } });
    await audit(session, { action: "CREATE", entityType: "DocumentRequest", entityId: q.id, summary: `Received ${t.name} request ${q.requestNo} from ${r.firstName} ${r.lastName}` }, tx);
    return q;
  });
  refreshDashboard();
  return ok(`Request ${req2.requestNo} recorded.`);
}

const MOVES: Record<string, { from: string[]; to: "PROCESSING" | "REJECTED" | "CANCELLED" | "RELEASED"; verb: string }> = {
  process: { from: ["PENDING"], to: "PROCESSING", verb: "Started processing" },
  reject: { from: ["PENDING", "PROCESSING"], to: "REJECTED", verb: "Rejected" },
  cancel: { from: ["PENDING", "PROCESSING"], to: "CANCELLED", verb: "Cancelled" },
  release: { from: ["READY_FOR_RELEASE"], to: "RELEASED", verb: "Released" },
};

export async function moveRequest(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("documents:issue");
  const id = String(fd.get("id") ?? "");
  const move = MOVES[String(fd.get("move") ?? "")];
  const reason = String(fd.get("reason") ?? "").trim();
  if (!move) return fail("Unknown action.");
  if (move.to === "REJECTED" && reason.length < 5) return fail("Tell the resident why the request was rejected.", { reason: "Give a reason." });
  const q = await db.documentRequest.findFirst({ where: { id, barangayCode: session.barangay.code }, include: { documentType: true } });
  if (!q) return fail("This request no longer exists.");
  if (!move.from.includes(q.status)) return fail("This request has already moved on. Refresh the page.");
  await db.$transaction(async (tx) => {
    await tx.documentRequest.update({
      where: { id },
      data: {
        status: move.to,
        processedById: session.user.id,
        ...(move.to === "REJECTED" ? { rejectionReason: reason } : {}),
        ...(move.to === "CANCELLED" && reason ? { remarks: reason } : {}),
        ...(move.to === "RELEASED" ? { releasedAt: new Date() } : {}),
      },
    });
    await audit(session, { action: "UPDATE", entityType: "DocumentRequest", entityId: id, summary: `${move.verb} ${q.documentType.name} request ${q.requestNo}${reason ? `: ${reason}` : ""}` }, tx);
  });
  refreshDashboard();
  return ok(`${move.verb} ${q.requestNo}.`);
}

// ───────── Issuing ─────────

export type IssueInput = { typeId: string; residentId: string; purpose: string; orNumber?: string; requestId?: string };
export type IssueResult = { ok: true; id: string; controlNo: string } | { ok: false; message: string; field?: string };

/**
 * Issues a document. Everything is re-checked here: the resident and type belong to this barangay,
 * the fee needs an OR number, and the control number comes from a per-barangay counter.
 */
export async function issueDocument(input: IssueInput): Promise<IssueResult> {
  const session = await authorize("documents:issue");
  const parsed = z
    .object({ typeId: z.string().min(1).max(40), residentId: z.string().min(1, "Select the resident first.").max(40), purpose: z.string().trim().min(2, "Enter the purpose of the document.").max(200), orNumber: z.string().trim().max(40).optional(), requestId: z.string().max(40).optional() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the details.", field: String(parsed.error.issues[0]?.path[0] ?? "") };
  const v = parsed.data;
  const code = session.barangay.code;
  const [t, r, request] = await Promise.all([
    db.documentType.findFirst({ where: { id: v.typeId, barangayCode: code, isActive: true } }),
    db.resident.findFirst({ where: { id: v.residentId, barangayCode: code, deletedAt: null }, include: { purok: true } }),
    v.requestId ? db.documentRequest.findFirst({ where: { id: v.requestId, barangayCode: code } }) : null,
  ]);
  if (!t) return { ok: false, message: "This document type is not available." };
  if (!r) return { ok: false, message: "Select a resident of this barangay.", field: "residentId" };
  if (r.status !== "ACTIVE") return { ok: false, message: "This resident is no longer active (moved out or deceased).", field: "residentId" };
  if (Number(t.fee) > 0 && !v.orNumber) return { ok: false, message: "Enter the official receipt number for the fee.", field: "orNumber" };
  if (v.requestId && (!request || !["PENDING", "PROCESSING"].includes(request.status))) return { ok: false, message: "That request was already processed. Open it again from the request list." };
  if (request && (request.residentId !== r.id || request.documentTypeId !== t.id)) return { ok: false, message: "The resident or document does not match the request." };
  if (t.key === "jobseeker") {
    const prior = await db.issuedDocument.findFirst({ where: { barangayCode: code, residentId: r.id, documentTypeId: t.id, status: "VALID" } });
    if (prior) return { ok: false, message: `A First-Time Jobseeker Certification was already issued to this resident (${prior.controlNo}). RA 11261 allows it once.` };
  }

  const signatory = await getSignatory(session);
  const now = new Date();
  const validUntil = t.validityMonths ? new Date(new Date(now).setMonth(now.getMonth() + t.validityMonths)) : null;
  const doc = await db.$transaction(async (tx) => {
    const year = phYear(now);
    const n = await nextNumber(tx, code, `doc:${t.prefix}:${year}`);
    const d = await tx.issuedDocument.create({
      data: {
        barangayCode: code,
        controlNo: `${t.prefix}-${year}-${pad(n)}`,
        documentTypeId: t.id,
        residentId: r.id,
        requestId: request?.id ?? null,
        purpose: v.purpose,
        fee: t.fee,
        orNumber: Number(t.fee) > 0 ? v.orNumber! : null,
        issuedAt: now,
        validUntil,
        snapshot: {
          name: nameFull(r),
          age: ageOn(r.birthDate, now),
          sex: r.sex,
          civilStatus: r.civilStatus,
          address: `${r.address}${r.purok ? `, ${r.purok.name}` : ""}`,
          residentSince: r.residentSince,
        },
        signatoryName: signatory.name,
        signatoryPosition: signatory.position,
        issuedById: session.user.id,
      },
    });
    if (request) await tx.documentRequest.update({ where: { id: request.id }, data: { status: "READY_FOR_RELEASE", processedById: session.user.id } });
    await audit(session, { action: "ISSUE", entityType: "IssuedDocument", entityId: d.id, summary: `Issued ${t.name} ${d.controlNo} to ${r.firstName} ${r.lastName}` }, tx);
    return d;
  });
  refreshDashboard();
  return { ok: true, id: doc.id, controlNo: doc.controlNo };
}

export async function voidDocument(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("documents:issue");
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 5) return fail("Give the reason for voiding.", { reason: "Give a reason." });
  const d = await db.issuedDocument.findFirst({ where: { id, barangayCode: session.barangay.code }, include: { documentType: true } });
  if (!d) return fail("This document no longer exists.");
  if (d.status === "VOIDED") return fail("This document is already void.");
  await db.$transaction(async (tx) => {
    await tx.issuedDocument.update({ where: { id }, data: { status: "VOIDED", voidReason: reason, voidedAt: new Date(), voidedById: session.user.id } });
    await audit(session, { action: "VOID", entityType: "IssuedDocument", entityId: id, summary: `Voided ${d.documentType.name} ${d.controlNo}: ${reason}` }, tx);
  });
  refreshDashboard();
  return ok(`${d.controlNo} is now void. It stays in the history.`);
}

/** Counts each print, so reprints are visible in the record. */
export async function recordPrint(id: string): Promise<void> {
  const session = await authorize("documents:issue");
  const d = await db.issuedDocument.findFirst({ where: { id, barangayCode: session.barangay.code, status: "VALID" } });
  if (!d) return;
  await db.issuedDocument.update({ where: { id }, data: { printCount: { increment: 1 } } });
  if (d.printCount > 0) await audit(session, { action: "EXPORT", entityType: "IssuedDocument", entityId: id, summary: `Reprinted ${d.controlNo} (copy ${d.printCount + 1})` });
}

// ───────── Settings per document type ─────────

export async function updateDocumentType(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("documents:issue");
  const id = String(fd.get("id") ?? "");
  const p = parse(
    z.object({
      name: req("Name", 120),
      description: req("Description", 500),
      fee: z.coerce.number({ error: "Enter the fee." }).min(0, "Fee cannot be negative.").max(100_000),
      validityMonths: optInt(1, 120),
      requirements: opt(2000),
      isActive: bool,
    }),
    fd,
  );
  if (!p.ok) return p.state;
  const t = await db.documentType.findFirst({ where: { id, barangayCode: session.barangay.code } });
  if (!t) return fail("This document type no longer exists.");
  const v = p.data;
  const requirements = (v.requirements ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  await db.$transaction(async (tx) => {
    await tx.documentType.update({ where: { id }, data: { name: v.name, description: v.description, fee: new Prisma.Decimal(v.fee), validityMonths: v.validityMonths ?? null, requirements, isActive: v.isActive } });
    await audit(
      session,
      {
        action: "UPDATE",
        entityType: "DocumentType",
        entityId: id,
        summary: `Updated settings for ${v.name}`,
        changes: { fee: [Number(t.fee), v.fee], validityMonths: [t.validityMonths, v.validityMonths ?? null], isActive: [t.isActive, v.isActive] },
      },
      tx,
    );
  });
  refreshDashboard();
  return ok("Settings saved. New documents use them; issued ones keep their original fee and validity.");
}
