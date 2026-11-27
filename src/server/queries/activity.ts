import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { AUDIT_ACTION } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, pageOf, str, words, type SearchParams } from "@/server/params";
import type { Session } from "@/types/dashboard";

const PAGE = 25;

/** The barangay's audit log. VAWC entries are summarized without names, so the log never leaks them. */
export async function listActivity(session: Session, sp: SearchParams, updatesOnly = false) {
  const page = pageOf(sp.page);
  const action = oneOf(str(sp.action), AUDIT_ACTION);
  const entity = str(sp.entity);
  const mine = str(sp.who) === "me";
  const where: Prisma.AuditLogWhereInput = {
    barangayCode: session.barangay.code,
    ...(updatesOnly ? { action: { in: ["UPDATE", "DELETE", "RESTORE", "VOID"] } } : action ? { action } : { action: { notIn: ["LOGIN_FAILED"] } }),
    ...(entity ? { entityType: entity } : {}),
    ...(mine ? { actorId: session.user.id } : {}),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ summary: { contains: t, mode: "insensitive" } }, { actorName: { contains: t, mode: "insensitive" } }] })),
  };
  const [rows, total, entities] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where: { barangayCode: session.barangay.code }, select: { entityType: true }, distinct: ["entityType"] }),
  ]);
  return { rows, total, page, pageSize: PAGE, entities: entities.map((e) => e.entityType).sort() };
}
