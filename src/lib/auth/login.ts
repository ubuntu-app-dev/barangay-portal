import { ROUTES } from "@/lib/routes";
import type { LoginRole } from "@/types/login";

export type LoginLocation = {
  regionCode?: string;
  provinceCode?: string;
  municipalityCode?: string;
  barangayCode?: string;
};
export type LoginPayload = {
  role: LoginRole;
  username: string;
  password: string;
  location: LoginLocation;
};
export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

/**
 * Posts to /api/auth/login, which this project does not include yet.
 * The server must check that the account really belongs to the chosen role and location;
 * the dropdowns only narrow the choice, they are not a security control.
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 404)
      return {
        ok: false,
        message: "The sign-in service is not connected yet.",
      };
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      redirectTo?: string;
    };
    if (!res.ok)
      return {
        ok: false,
        message:
          data.message ?? "Sign-in failed. Check your details and try again.",
      };
    return { ok: true, redirectTo: data.redirectTo ?? ROUTES.home };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach the server. Check your connection and try again.",
    };
  }
}
