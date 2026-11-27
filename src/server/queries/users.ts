import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import type { StaffSession } from "@/lib/auth/staff";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";

export const ROLE_LABEL: Record<Role, string> = {
  BARANGAY_SECRETARY: "Barangay Secretary",
  MUNICIPAL_PERSONNEL: "Municipal Personnel",
  MUNICIPAL_ADMIN: "Municipal IT Admin",
  SUPERADMIN: "Superadmin",
};
export const STATUS_LABEL = { ACTIVE: "Active", SUSPENDED: "Suspended", DEACTIVATED: "Deactivated" } as const;

/** Roles each actor may create and manage. */
export function manageableRoles(actor: StaffSession): Role[] {
  if (actor.role === "SUPERADMIN") return ["MUNICIPAL_ADMIN", "SUPERADMIN", "MUNICIPAL_PERSONNEL", "BARANGAY_SECRETARY"];
  if (actor.role === "MUNICIPAL_ADMIN") return ["BARANGAY_SECRETARY", "MUNICIPAL_PERSONNEL"];
  return [];
}

/** Users the actor may see: an IT admin sees its municipality; a superadmin sees everyone (optionally by role). */
export function userScope(actor: StaffSession, roles?: Role[]): Prisma.UserWhereInput {
  const allowed = roles ?? manageableRoles(actor);
  if (actor.role === "SUPERADMIN") return { role: { in: allowed } };
  const code = actor.municipality!.code;
  return { role: { in: allowed }, OR: [{ municipalityCode: code }, { barangay: { municipalityCode: code } }] };
}

export async function listUsers(actor: StaffSession, sp: SearchParams, roles?: Role[]) {
  const page = pageOf(sp.page);
  const role = oneOf(str(sp.role), ROLE_LABEL);
  const status = oneOf(str(sp.status), STATUS_LABEL);
  const barangay = str(sp.barangay);
  const municipality = str(sp.municipality);
  const locked = str(sp.locked) === "1";
  const where: Prisma.UserWhereInput = {
    AND: [
      userScope(actor, roles),
      ...(role ? [{ role }] : []),
      ...(status ? [{ status }] : []),
      ...(barangay ? [{ barangayCode: barangay }] : []),
      ...(municipality ? [{ OR: [{ municipalityCode: municipality }, { barangay: { municipalityCode: municipality } }] }] : []),
      ...(locked ? [{ lockedUntil: { gt: new Date() } }] : []),
      ...words(str(sp.q)).map((t) => ({
        OR: [
          { username: { contains: t, mode: "insensitive" as const } },
          { firstName: { contains: t, mode: "insensitive" as const } },
          { lastName: { contains: t, mode: "insensitive" as const } },
          { email: { contains: t, mode: "insensitive" as const } },
        ],
      })),
    ],
  };
  const [rows, total] = await Promise.all([
    db.user.findMany({ where, include: { barangay: true, office: true, municipality: true }, orderBy: [{ role: "asc" }, { lastName: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.user.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function getManagedUser(actor: StaffSession, id: string, roles?: Role[]) {
  const u = await db.user.findFirst({ where: { AND: [{ id }, userScope(actor, roles)] }, include: { barangay: { include: { municipality: true } }, office: true, municipality: true } });
  if (!u) notFound();
  const [activity, sessions] = await Promise.all([
    db.auditLog.findMany({ where: { OR: [{ actorId: id }, { entityType: "User", entityId: id }] }, orderBy: { createdAt: "desc" }, take: 15 }),
    db.session.count({ where: { userId: id, expiresAt: { gt: new Date() } } }),
  ]);
  return { ...u, activity, sessions };
}

/** Options for the account form: barangays and offices the actor may assign. */
export async function assignmentOptions(actor: StaffSession) {
  const where = actor.role === "SUPERADMIN" ? {} : { municipalityCode: actor.municipality!.code };
  const [barangays, offices, municipalities] = await Promise.all([
    db.barangay.findMany({ where: { ...where, isActive: true }, include: { municipality: true }, orderBy: [{ municipalityCode: "asc" }, { name: "asc" }] }),
    db.municipalOffice.findMany({ where: { ...where, isActive: true }, include: { municipality: true }, orderBy: [{ municipalityCode: "asc" }, { name: "asc" }] }),
    actor.role === "SUPERADMIN" ? db.municipality.findMany({ orderBy: { name: "asc" }, include: { province: true } }) : Promise.resolve([]),
  ]);
  const multi = actor.role === "SUPERADMIN";
  return {
    barangays: barangays.map((b) => ({ value: b.code, label: multi ? `${b.name}, ${b.municipality.name}` : `Barangay ${b.name}` })),
    offices: offices.map((o) => ({ value: o.id, label: multi ? `${o.name} (${o.municipality.name})` : o.name })),
    municipalities: municipalities.map((m) => ({ value: m.code, label: `${m.name}${m.province ? `, ${m.province.name}` : ""}${m.isActive ? "" : " (inactive)"}` })),
  };
}
