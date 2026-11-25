import { redirect } from "next/navigation";
import { sampleSession } from "@/lib/dashboard/sample-data";
import { ROUTES } from "@/lib/routes";
import type { Session } from "@/types/dashboard";

/** Sample data is on in development, and in production only when DASHBOARD_SAMPLE_DATA=true. */
export function sampleDataEnabled(): boolean {
  const flag = process.env.DASHBOARD_SAMPLE_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development";
}

/**
 * TODO: replace with the real lookup. Read the HTTP-only session cookie, verify it on the server,
 * and return the user, their ONE assigned barangay, and their permissions from the database.
 * The barangay must never come from the URL or from anything the user can edit.
 */
export async function getSession(): Promise<Session | null> {
  if (sampleDataEnabled()) return sampleSession;
  return null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);
  return session;
}

