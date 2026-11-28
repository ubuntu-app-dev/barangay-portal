import { disablePush } from "@/lib/push-client";

/** Ends the session on the server. The caller then goes to /login. */
export async function logout(): Promise<void> {
  // Stop this device's reminders first, so a shared computer doesn't keep getting the last user's notifications.
  await Promise.race([disablePush().catch(() => {}), new Promise((r) => setTimeout(r, 3000))]);
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Nothing to do: the caller navigates to the sign-in page either way.
  }
}
