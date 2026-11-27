import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StaffSession } from "@/lib/auth/staff";
import { AUDIT_ACTION } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, pageOf, str, words, type SearchParams } from "@/server/params";

const DAY = 86400_000;

export async function adminOverview(u: StaffSession) {
  const code = u.municipality!.code;
  const inMun: Prisma.UserWhereInput = { OR: [{ municipalityCode: code }, { barangay: { municipalityCode: code } }], role: { in: ["BARANGAY_SECRETARY", "MUNICIPAL_PERSONNEL"] } };
  const since = new Date(Date.now() - 7 * DAY);
  const [byStatus, locked, temp, barangays, failed, recentFailed, noAccount] = await Promise.all([
    db.user.groupBy({ by: ["status"], where: inMun, _count: true }),
    db.user.count({ where: { ...inMun, lockedUntil: { gt: new Date() } } }),
    db.user.count({ where: { ...inMun, mustChangePassword: true, status: "ACTIVE" } }),
    db.barangay.groupBy({ by: ["isActive"], where: { municipalityCode: code }, _count: true }),
    db.auditLog.count({ where: { municipalityCode: code, action: "LOGIN_FAILED", createdAt: { gte: since } } }),
    db.auditLog.findMany({ where: { municipalityCode: code, action: "LOGIN_FAILED" }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.barangay.findMany({ where: { municipalityCode: code, isActive: true, users: { none: { role: "BARANGAY_SECRETARY", status: "ACTIVE" } } }, select: { code: true, name: true } }),
  ]);
  return {
    active: byStatus.find((s) => s.status === "ACTIVE")?._count ?? 0,
    blocked: byStatus.filter((s) => s.status !== "ACTIVE").reduce((s, x) => s + x._count, 0),
    locked,
    temp,
    barangaysActive: barangays.find((b) => b.isActive)?._count ?? 0,
    barangaysTotal: barangays.reduce((s, b) => s + b._count, 0),
    failed,
    recentFailed,
    noAccount,
  };
}

export async function barangaysForAdmin(u: StaffSession) {
  const code = u.municipality!.code;
  const [rows, secretaries, residents] = await Promise.all([
    db.barangay.findMany({ where: { municipalityCode: code }, include: { _count: { select: { puroks: true, documentTypes: true } } }, orderBy: { name: "asc" } }),
    db.user.groupBy({ by: ["barangayCode"], where: { role: "BARANGAY_SECRETARY", status: "ACTIVE", barangay: { municipalityCode: code } }, _count: true }),
    db.resident.groupBy({ by: ["barangayCode"], where: { barangay: { municipalityCode: code }, deletedAt: null }, _count: true }),
  ]);
  return rows.map((b) => ({ ...b, secretaries: secretaries.find((s) => s.barangayCode === b.code)?._count ?? 0, residents: residents.find((r) => r.barangayCode === b.code)?._count ?? 0 }));
}

export async function officesForAdmin(u: StaffSession) {
  return db.municipalOffice.findMany({
    where: { municipalityCode: u.municipality!.code },
    include: { _count: { select: { users: { where: { status: "ACTIVE" } }, requirements: { where: { isActive: true } } } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

const PAGE = 30;

/** The audit log: one municipality for IT admins, everything (or one municipality) for the superadmin. */
export async function listAudit(u: StaffSession, sp: SearchParams) {
  const page = pageOf(sp.page);
  const action = oneOf(str(sp.action), AUDIT_ACTION);
  const barangay = str(sp.barangay);
  const municipality = u.role === "SUPERADMIN" ? str(sp.municipality) : u.municipality!.code;
  const where: Prisma.AuditLogWhereInput = {
    ...(municipality ? { municipalityCode: municipality } : {}),
    ...(action ? { action } : {}),
    ...(barangay ? { barangayCode: barangay } : {}),
    ...(str(sp.scope) === "municipal" ? { barangayCode: null } : {}),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ summary: { contains: t, mode: "insensitive" } }, { actorName: { contains: t, mode: "insensitive" } }, { ip: { contains: t } }] })),
  };
  const [rows, total] = await Promise.all([db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }), db.auditLog.count({ where })]);
  return { rows, total, page, pageSize: PAGE };
}
