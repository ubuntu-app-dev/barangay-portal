/** Ends the session on the server (POST /api/auth/logout, not included yet). The caller then goes to /login. */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Nothing to do: the caller navigates to the sign-in page either way.
  }
}
