import "server-only";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import type { Session } from "@/types/dashboard";

/** Re-checks the session and permission inside every action: actions are reachable by direct POST. */
export async function authorize(permission?: string): Promise<Session> {
  const session = await requireSession();
  if (!can(session.permissions, permission)) throw new Error("You do not have permission to do this.");
  return session;
}

/** Refresh every signed-in page (lists, counts, menu badges) after a change. */
export const refreshDashboard = () => revalidatePath("/", "layout");

/** Prisma unique-constraint violation. */
export const isUnique = (e: unknown) => typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002";
