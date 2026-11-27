import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { BLOTTER_KIND, BLOTTER_STATUS, KP_STAGE } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import { monthStart } from "@/server/time";
import type { Session } from "@/types/dashboard";

export const OPEN_STATUSES = ["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] as const;
export const canSeeVawc = (s: Session) => s.permissions.includes("vawc:view");

export type BlotterScope = { kind?: "INCIDENT" | "COMPLAINT"; kp?: boolean; open?: boolean; vawc?: boolean };

function baseWhere(session: Session, scope: BlotterScope): Prisma.BlotterEntryWhereInput {
  return {
    barangayCode: session.barangay.code,
    deletedAt: null,
    // VAWC entries live only on the VAWC page, and only for users with the permission.
    isVawc: scope.vawc ? true : false,
    ...(scope.kind ? { kind: scope.kind } : {}),
    ...(scope.kp ? { kpStage: { not: null } } : {}),
    ...(scope.open ? { status: { in: [...OPEN_STATUSES] } } : {}),
  };
}

export async function listBlotter(session: Session, sp: SearchParams, scope: BlotterScope = {}, limit?: number) {
  if (scope.vawc && !canSeeVawc(session)) notFound();
  const page = limit ? 1 : pageOf(sp.page);
  const take = limit ?? PAGE_SIZE;
  const status = oneOf(str(sp.status), BLOTTER_STATUS);
  const kind = oneOf(str(sp.kind), BLOTTER_KIND);
  const stage = oneOf(str(sp.stage), KP_STAGE);
  const category = str(sp.category);
  const where: Prisma.BlotterEntryWhereInput = {
    ...baseWhere(session, scope),
    ...(status ? { status } : {}),
    ...(kind && !scope.kind ? { kind } : {}),
    ...(stage ? { kpStage: stage } : {}),
    ...(category ? { category } : {}),
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { blotterNo: { contains: t, mode: "insensitive" } },
        { kpCaseNo: { contains: t, mode: "insensitive" } },
        { title: { contains: t, mode: "insensitive" } },
        { location: { contains: t, mode: "insensitive" } },
        { parties: { some: { name: { contains: t, mode: "insensitive" } } } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    db.blotterEntry.findMany({
      where,
      include: { parties: { orderBy: { role: "asc" } }, hearings: { orderBy: { scheduledAt: "desc" }, take: 1 } },
      orderBy: scope.open || scope.kp ? [{ kpDeadline: { sort: "asc", nulls: "last" } }, { incidentAt: "desc" }] : { incidentAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    db.blotterEntry.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function blotterSummary(session: Session, scope: BlotterScope = {}) {
  const where = baseWhere(session, scope);
  const [open, month, settled, kp, overdue] = await Promise.all([
    db.blotterEntry.count({ where: { ...where, status: { in: [...OPEN_STATUSES] } } }),
    db.blotterEntry.count({ where: { ...where, incidentAt: { gte: monthStart(0) } } }),
    db.blotterEntry.count({ where: { ...where, status: { in: ["SETTLED", "CLOSED"] } } }),
    db.blotterEntry.count({ where: { ...where, kpStage: { not: null }, status: { in: [...OPEN_STATUSES] } } }),
    db.blotterEntry.count({ where: { ...where, kpDeadline: { lt: new Date() }, status: { in: [...OPEN_STATUSES] } } }),
  ]);
  return { open, month, settled, kp, overdue };
}

export async function kpStageCounts(session: Session) {
  const rows = await db.blotterEntry.groupBy({
    by: ["kpStage", "status"],
    where: { barangayCode: session.barangay.code, deletedAt: null, isVawc: false, kpStage: { not: null } },
    _count: true,
  });
  return rows;
}

export async function getBlotterEntry(session: Session, id: string) {
  const e = await db.blotterEntry.findFirst({
    where: { id, barangayCode: session.barangay.code, deletedAt: null },
    include: { purok: true, parties: { include: { resident: { select: { id: true, residentNo: true } } }, orderBy: { role: "asc" } }, hearings: { orderBy: { scheduledAt: "asc" } } },
  });
  if (!e || (e.isVawc && !canSeeVawc(session))) notFound();
  const history = await db.auditLog.findMany({ where: { barangayCode: session.barangay.code, entityType: "BlotterEntry", entityId: id }, orderBy: { createdAt: "desc" }, take: 20 });
  return { ...e, history };
}

export async function blotterCategories(session: Session) {
  const rows = await db.blotterEntry.findMany({ where: { barangayCode: session.barangay.code, deletedAt: null }, select: { category: true }, distinct: ["category"] });
  return rows.map((r) => r.category).sort();
}
