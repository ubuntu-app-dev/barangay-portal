import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { REQUEST_STATUS } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import { monthStart } from "@/server/time";
import type { DocumentTypeInfo, IssuedStatus } from "@/types/documents";
import type { Session } from "@/types/dashboard";

/** The four certificates that have their own page in the menu. */
export const CERTIFICATE_PAGES: Record<string, string> = {
  clearance: "barangay-clearance",
  indigency: "certificate-of-indigency",
  residency: "certificate-of-residency",
  "good-moral": "certificate-of-good-moral-character",
};

export async function getDocumentTypes(session: Session, includeInactive = false): Promise<DocumentTypeInfo[]> {
  const rows = await db.documentType.findMany({
    where: { barangayCode: session.barangay.code, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    shortName: t.shortName,
    description: t.description,
    slug: CERTIFICATE_PAGES[t.key],
    category: t.category === "CERTIFICATE" ? "certificate" : "other",
    requirements: t.requirements,
    fee: Number(t.fee),
    validityMonths: t.validityMonths,
    prefix: t.prefix,
    isActive: t.isActive,
  }));
}

/** The official who signs certificates (falls back to the Punong Barangay). */
export async function getSignatory(session: Session) {
  const o =
    (await db.barangayOfficial.findFirst({ where: { barangayCode: session.barangay.code, isActive: true, isSignatory: true } })) ??
    (await db.barangayOfficial.findFirst({ where: { barangayCode: session.barangay.code, isActive: true, position: "Punong Barangay" } }));
  return o ? { name: o.name, position: o.position } : { name: "[Punong Barangay]", position: "Punong Barangay" };
}

export const issuedStatus = (d: { status: string; validUntil: Date | null }, now = new Date()): IssuedStatus =>
  d.status === "VOIDED" ? "Voided" : d.validUntil && d.validUntil < now ? "Expired" : "Valid";

export async function requestStats(session: Session) {
  const code = session.barangay.code;
  const [groups, released] = await Promise.all([
    db.documentRequest.groupBy({ by: ["status"], where: { barangayCode: code }, _count: true }),
    db.documentRequest.count({ where: { barangayCode: code, status: "RELEASED", releasedAt: { gte: monthStart(0) } } }),
  ]);
  const c = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  return { pending: c("PENDING"), processing: c("PROCESSING"), ready: c("READY_FOR_RELEASE"), releasedThisMonth: released };
}

export async function listRequests(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const status = oneOf(str(sp.status), REQUEST_STATUS);
  const type = str(sp.type);
  const open = str(sp.view) !== "all";
  const where: Prisma.DocumentRequestWhereInput = {
    barangayCode: session.barangay.code,
    ...(status ? { status } : open ? { status: { in: ["PENDING", "PROCESSING", "READY_FOR_RELEASE"] } } : {}),
    ...(type ? { documentTypeId: type } : {}),
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { requestNo: { contains: t, mode: "insensitive" } },
        { purpose: { contains: t, mode: "insensitive" } },
        { resident: { OR: [{ firstName: { contains: t, mode: "insensitive" } }, { lastName: { contains: t, mode: "insensitive" } }] } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    db.documentRequest.findMany({
      where,
      include: { resident: true, documentType: true, issued: { select: { id: true, controlNo: true } } },
      orderBy: [{ requestedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.documentRequest.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function listIssued(session: Session, sp: SearchParams, scope: { typeId?: string; category?: "CERTIFICATE" | "OTHER" } = {}, limit?: number) {
  const page = limit ? 1 : pageOf(sp.page);
  const take = limit ?? PAGE_SIZE;
  const now = new Date();
  const status = oneOf(str(sp.status), ["valid", "expired", "voided"] as const);
  const type = scope.typeId ?? str(sp.type);
  const month = str(sp.month);
  let monthRange: { gte: Date; lt: Date } | undefined;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const start = new Date(`${month}-01T00:00:00+08:00`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    monthRange = { gte: start, lt: end };
  }
  const where: Prisma.IssuedDocumentWhereInput = {
    barangayCode: session.barangay.code,
    ...(type ? { documentTypeId: type } : {}),
    ...(scope.category ? { documentType: { category: scope.category } } : {}),
    ...(monthRange ? { issuedAt: monthRange } : {}),
    ...(status === "voided" ? { status: "VOIDED" } : status === "expired" ? { status: "VALID", validUntil: { lt: now } } : status === "valid" ? { status: "VALID", OR: [{ validUntil: null }, { validUntil: { gte: now } }] } : {}),
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { controlNo: { contains: t, mode: "insensitive" } },
        { orNumber: { contains: t, mode: "insensitive" } },
        { purpose: { contains: t, mode: "insensitive" } },
        { resident: { OR: [{ firstName: { contains: t, mode: "insensitive" } }, { lastName: { contains: t, mode: "insensitive" } }] } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    db.issuedDocument.findMany({ where, include: { resident: true, documentType: true }, orderBy: { issuedAt: "desc" }, skip: (page - 1) * take, take }),
    db.issuedDocument.count({ where }),
  ]);
  return { rows: rows.map((r) => ({ ...r, display: issuedStatus(r, now) })), total, page, pageSize: PAGE_SIZE };
}

/** Issued this month and in total, per document type. */
export async function typeStats(session: Session) {
  const code = session.barangay.code;
  const [month, all] = await Promise.all([
    db.issuedDocument.groupBy({ by: ["documentTypeId"], where: { barangayCode: code, status: "VALID", issuedAt: { gte: monthStart(0) } }, _count: true }),
    db.issuedDocument.groupBy({ by: ["documentTypeId"], where: { barangayCode: code, status: "VALID" }, _count: true }),
  ]);
  return (typeId: string) => ({ thisMonth: month.find((m) => m.documentTypeId === typeId)?._count ?? 0, total: all.find((m) => m.documentTypeId === typeId)?._count ?? 0 });
}

export async function getIssuedDocument(session: Session, id: string) {
  const d = await db.issuedDocument.findFirst({
    where: { id, barangayCode: session.barangay.code },
    include: { documentType: true, resident: true, request: true },
  });
  if (!d) notFound();
  return d;
}

export async function getRequest(session: Session, id: string | undefined) {
  if (!id) return null;
  return db.documentRequest.findFirst({
    where: { id, barangayCode: session.barangay.code, status: { in: ["PENDING", "PROCESSING"] } },
    include: { resident: { include: { purok: true } }, documentType: true },
  });
}
