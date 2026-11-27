import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";
import { ROUTES } from "@/lib/routes";
import { actorOf, getAuthUser, ROLE_HOME, type AuthUser } from "@/server/auth";

export type StaffSession = AuthUser & { actor: ReturnType<typeof actorOf> };

/**
 * For the municipal, admin, and superadmin areas. Anyone else is sent to their own home.
 * Municipal roles always carry their municipality; pages filter every query by it.
 */
export async function requireRole(...roles: Role[]): Promise<StaffSession> {
  const u = await getAuthUser();
  if (!u) redirect(ROUTES.login);
  if (!roles.includes(u.role)) redirect(ROLE_HOME[u.role]);
  if (u.role !== "SUPERADMIN" && u.role !== "BARANGAY_SECRETARY" && !u.municipality) redirect(ROUTES.login);
  return { ...u, actor: actorOf(u) };
}

/** Any signed-in user (for settings and notifications shared by every role). */
export async function requireUser(): Promise<StaffSession> {
  const u = await getAuthUser();
  if (!u) redirect(ROUTES.login);
  return { ...u, actor: actorOf(u) };
}
