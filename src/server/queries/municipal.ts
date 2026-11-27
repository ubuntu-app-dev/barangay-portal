import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import type { StaffSession } from "@/lib/auth/staff";
import { SUBMISSION_STATUS } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import { monthStart } from "@/server/time";

/** Everything here is limited to the signed-in user's municipality. */
const mun = (u: StaffSession) => u.municipality!.code;

export async function activeBarangays(u: StaffSession) {
  return db.barangay.findMany({ where: { municipalityCode: mun(u), isActive: true }, orderBy: { name: "asc" } });
}

export async function municipalOverview(u: StaffSession) {
  const code = mun(u);
  const inMun = { barangay: { municipalityCode: code } };
  const [barangays, population, households, docsMonth, openCases, inbox, requirements, recent] = await Promise.all([
    db.barangay.groupBy({ by: ["isActive"], where: { municipalityCode: code }, _count: true }),
    db.resident.count({ where: { ...inMun, deletedAt: null, status: "ACTIVE" } }),
    db.household.count({ where: { ...inMun, deletedAt: null } }),
    db.issuedDocument.count({ where: { ...inMun, status: "VALID", issuedAt: { gte: monthStart(0) } } }),
    db.blotterEntry.count({ where: { ...inMun, deletedAt: null, isVawc: false, status: { in: ["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] } } }),
    db.submission.count({ where: { ...inMun, status: "SUBMITTED", ...(u.office ? { officeId: u.office.id } : {}) } }),
    requirementProgress(u),
    db.submission.findMany({ where: { ...inMun, status: { not: "DRAFT" } }, include: { barangay: true, office: true }, orderBy: { submittedAt: "desc" }, take: 6 }),
  ]);
  const active = barangays.find((b) => b.isActive)?._count ?? 0;
  const total = barangays.reduce((s, b) => s + b._count, 0);
  return { active, total, population, households, docsMonth, openCases, inbox, requirements, recent };
}

/** Each active requirement with how many active barangays have submitted it (not counting returned ones). */
export async function requirementProgress(u: StaffSession, includeInactive = false) {
  const [reqs, barangays] = await Promise.all([
    db.reportRequirement.findMany({
      where: { municipalityCode: mun(u), ...(includeInactive ? {} : { isActive: true }) },
      include: { office: true, submissions: { select: { barangayCode: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } },
      orderBy: [{ isActive: "desc" }, { dueAt: "asc" }],
    }),
    activeBarangays(u),
  ]);
  const active = new Set(barangays.map((b) => b.code));
  return reqs.map((r) => {
    const latest = new Map<string, string>();
    for (const s of r.submissions) if (!latest.has(s.barangayCode)) latest.set(s.barangayCode, s.status);
    const done = [...latest.entries()].filter(([b, st]) => active.has(b) && !["DRAFT", "RETURNED"].includes(st)).length;
    const approved = [...latest.entries()].filter(([b, st]) => active.has(b) && st === "APPROVED").length;
    return { ...r, done, approved, expected: active.size };
  });
}

export async function complianceFor(u: StaffSession, requirementId: string) {
  const r = await db.reportRequirement.findFirst({ where: { id: requirementId, municipalityCode: mun(u) }, include: { office: true } });
  if (!r) notFound();
  const [barangays, subs] = await Promise.all([
    activeBarangays(u),
    db.submission.findMany({ where: { requirementId: r.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const rows = barangays.map((b) => {
    const latest = subs.find((s) => s.barangayCode === b.code) ?? null;
    const late = latest?.submittedAt ? latest.submittedAt > r.dueAt : !latest && r.dueAt < new Date();
    return { barangay: b, latest, late };
  });
  return { requirement: r, rows };
}

export async function listInbox(u: StaffSession, sp: SearchParams) {
  const page = pageOf(sp.page);
  const status = oneOf(str(sp.status), SUBMISSION_STATUS);
  const barangay = str(sp.barangay);
  const allOffices = str(sp.office) === "all" || !u.office;
  const where: Prisma.SubmissionWhereInput = {
    barangay: { municipalityCode: mun(u) },
    status: status ?? { in: ["SUBMITTED", "UNDER_REVIEW"] },
    ...(barangay ? { barangayCode: barangay } : {}),
    ...(allOffices ? {} : { officeId: u.office!.id }),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" } }, { barangay: { name: { contains: t, mode: "insensitive" } } }] })),
  };
  const [rows, total] = await Promise.all([
    db.submission.findMany({ where, include: { barangay: true, office: true, requirement: { select: { dueAt: true } } }, orderBy: [{ submittedAt: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.submission.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE, allOffices };
}

export async function getSubmissionForReview(u: StaffSession, id: string) {
  const s = await db.submission.findFirst({ where: { id, barangay: { municipalityCode: mun(u) } }, include: { barangay: true, office: true, requirement: true } });
  if (!s) notFound();
  const [submitter, reviewer, versions] = await Promise.all([
    s.submittedById ? db.user.findUnique({ where: { id: s.submittedById }, select: { firstName: true, lastName: true } }) : null,
    s.reviewedById ? db.user.findUnique({ where: { id: s.reviewedById }, select: { firstName: true, lastName: true } }) : null,
    s.requirementId ? db.submission.findMany({ where: { requirementId: s.requirementId, barangayCode: s.barangayCode }, orderBy: { version: "desc" }, select: { id: true, version: true, status: true, submittedAt: true, remarks: true } }) : [],
  ]);
  const canReview = !u.office || u.office.id === s.officeId;
  return { ...s, submitter, reviewer, versions, canReview };
}

export async function barangayDirectory(u: StaffSession) {
  const code = mun(u);
  const [barangays, pop, hh, secretaries, progress] = await Promise.all([
    db.barangay.findMany({ where: { municipalityCode: code }, orderBy: { name: "asc" } }),
    db.resident.groupBy({ by: ["barangayCode"], where: { barangay: { municipalityCode: code }, deletedAt: null, status: "ACTIVE" }, _count: true }),
    db.household.groupBy({ by: ["barangayCode"], where: { barangay: { municipalityCode: code }, deletedAt: null }, _count: true }),
    db.user.findMany({ where: { role: "BARANGAY_SECRETARY", status: "ACTIVE", barangay: { municipalityCode: code } }, select: { barangayCode: true, firstName: true, lastName: true, phone: true, email: true } }),
    requirementProgress(u),
  ]);
  const now = Date.now();
  return barangays.map((b) => {
    const missing = progress.filter((r) => r.dueAt.getTime() < now && !r.submissions.some((s) => s.barangayCode === b.code && !["DRAFT", "RETURNED"].includes(s.status))).length;
    return {
      ...b,
      population: pop.find((p) => p.barangayCode === b.code)?._count ?? 0,
      households: hh.find((p) => p.barangayCode === b.code)?._count ?? 0,
      secretary: secretaries.find((s) => s.barangayCode === b.code) ?? null,
      overdue: b.isActive ? missing : 0,
    };
  });
}

export async function listMunicipalPosts(u: StaffSession, sp: SearchParams) {
  const page = pageOf(sp.page);
  const where: Prisma.AnnouncementWhereInput = {
    scope: "MUNICIPAL",
    municipalityCode: mun(u),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" } }, { body: { contains: t, mode: "insensitive" } }] })),
  };
  const [rows, total, secretaries] = await Promise.all([
    db.announcement.findMany({ where, include: { office: true, _count: { select: { reads: true } } }, orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.announcement.count({ where }),
    db.user.count({ where: { role: "BARANGAY_SECRETARY", status: "ACTIVE", barangay: { municipalityCode: mun(u) } } }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE, secretaries };
}
