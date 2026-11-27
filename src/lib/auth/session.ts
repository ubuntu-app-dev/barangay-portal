import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getAuthUser, ROLE_HOME } from "@/server/auth";
import type { Session } from "@/types/dashboard";

/**
 * The signed-in Barangay Secretary, their ONE assigned barangay, and their permissions, all from the database.
 * The barangay never comes from the URL or from anything the user can edit.
 */
export async function getSession(): Promise<Session | null> {
  const u = await getAuthUser();
  if (!u || u.role !== "BARANGAY_SECRETARY" || !u.barangay) return null;
  return {
    user: {
      id: u.id,
      username: u.username,
      name: u.name,
      firstName: u.firstName,
      position: u.position || "Barangay Secretary",
      email: u.email,
      role: "secretary",
      mustChangePassword: u.mustChangePassword,
    },
    barangay: u.barangay,
    permissions: u.permissions,
  };
}

/** For pages and server actions in the secretary dashboard. Other roles go to their own home. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (session) return session;
  const u = await getAuthUser();
  redirect(u ? ROLE_HOME[u.role] : ROUTES.login);
}
