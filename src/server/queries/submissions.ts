import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { REPORT_KIND, SUBMISSION_STATUS } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import type { Session } from "@/types/dashboard";

export async function getOffices(session: Session) {
  return db.municipalOffice.findMany({ where: { municipalityCode: session.barangay.municipalityCode, isActive: true }, orderBy: { name: "asc" } });
}

/** Every active requirement with this barangay's latest submission for it. */
export async function requirementsWithStatus(session: Session) {
  const reqs = await db.reportRequirement.findMany({
    where: { municipalityCode: session.barangay.municipalityCode, isActive: true },
    include: { office: true, submissions: { where: { barangayCode: session.barangay.code }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { dueAt: "asc" },
  });
  const now = Date.now();
  return reqs.map((r) => {
    const latest = r.submissions[0] ?? null;
    const done = latest && !["DRAFT", "RETURNED"].includes(latest.status);
    const overdue = !done && r.dueAt.getTime() < now;
    const soon = !done && !overdue && r.dueAt.getTime() - now < 7 * 86400_000;
    const state = done ? "Submitted" : latest?.status === "RETURNED" ? "Returned for Revision" : overdue ? "Overdue" : soon ? "Due Soon" : "Not Submitted";
    return { ...r, latest, done: !!done, state };
  });
}

export async function getRequirement(session: Session, id?: string) {
  if (!id) return null;
  return db.reportRequirement.findFirst({ where: { id, municipalityCode: session.barangay.municipalityCode, isActive: true }, include: { office: true } });
}

export async function listSubmissions(session: Session, sp: SearchParams, statuses?: ("SUBMITTED" | "UNDER_REVIEW" | "RETURNED" | "APPROVED" | "DRAFT")[]) {
  const page = pageOf(sp.page);
  const status = oneOf(str(sp.status), SUBMISSION_STATUS);
  const kind = oneOf(str(sp.kind), REPORT_KIND);
  const where: Prisma.SubmissionWhereInput = {
    barangayCode: session.barangay.code,
    ...(status ? { status } : statuses ? { status: { in: statuses } } : {}),
    ...(kind ? { kind } : {}),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" } }, { office: { name: { contains: t, mode: "insensitive" } } }] })),
  };
  const [rows, total] = await Promise.all([
    db.submission.findMany({ where, include: { office: true }, orderBy: [{ submittedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.submission.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function getSubmission(session: Session, id: string) {
  const s = await db.submission.findFirst({ where: { id, barangayCode: session.barangay.code }, include: { office: true, requirement: true } });
  if (!s) notFound();
  const [submitter, reviewer, history] = await Promise.all([
    s.submittedById ? db.user.findUnique({ where: { id: s.submittedById }, select: { firstName: true, lastName: true } }) : null,
    s.reviewedById ? db.user.findUnique({ where: { id: s.reviewedById }, select: { firstName: true, lastName: true, position: true } }) : null,
    db.auditLog.findMany({ where: { entityType: "Submission", entityId: id }, orderBy: { createdAt: "asc" } }),
  ]);
  return { ...s, submitter, reviewer, history };
}
