import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import type { Role } from "@/generated/prisma/enums";
import { db } from "./db";
import { getSettings } from "./settings";

export const SESSION_COOKIE = "lgu_session";
export const SESSION_HOURS = 12;

/** What every role can do by default. Per-user extras (e.g. "vawc:view") live in User.permissions. */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  BARANGAY_SECRETARY: [
    "profile:edit",
    "residents:manage",
    "documents:issue",
    "incidents:record",
    "resources:manage",
    "reports:submit",
    "announcements:barangay",
  ],
  MUNICIPAL_PERSONNEL: ["submissions:review", "announcements:municipal", "reports:consolidated"],
  MUNICIPAL_ADMIN: ["users:manage", "barangays:onboard", "documents:configure", "audit:view"],
  SUPERADMIN: ["*"],
};

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<Role, string> = {
  BARANGAY_SECRETARY: "/dashboard",
  MUNICIPAL_PERSONNEL: "/municipal",
  MUNICIPAL_ADMIN: "/admin",
  SUPERADMIN: "/superadmin",
};

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  firstName: string;
  position: string;
  role: Role;
  email: string | null;
  mustChangePassword: boolean;
  permissions: string[];
  barangay: { code: string; name: string; municipality: string; municipalityCode: string; province: string } | null;
  municipality: { code: string; name: string; province: string } | null;
  office: { id: string; name: string; acronym: string | null } | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const fullName = (u: { firstName: string; middleName?: string | null; lastName: string; suffix?: string | null }) =>
  [u.firstName, u.middleName ? `${u.middleName[0]}.` : null, u.lastName, u.suffix].filter(Boolean).join(" ");

/** Reads the session cookie and loads the signed-in user. Cached per request. Null when signed out or expired. */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: {
      user: {
        include: {
          barangay: { include: { municipality: { include: { province: true, region: true } } } },
          municipality: { include: { province: true, region: true } },
          office: true,
        },
      },
    },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  const u = session.user;
  if (u.status !== "ACTIVE") return null;

  const b = u.barangay;
  const m = u.municipality ?? b?.municipality ?? null;
  return {
    id: u.id,
    username: u.username,
    name: fullName(u),
    firstName: u.firstName,
    position: u.position ?? "",
    role: u.role,
    email: u.email,
    mustChangePassword: u.mustChangePassword,
    permissions: [...new Set([...ROLE_PERMISSIONS[u.role], ...u.permissions])],
    barangay: b
      ? {
          code: b.code,
          name: `Barangay ${b.name}`,
          municipality: b.municipality.name,
          municipalityCode: b.municipalityCode,
          province: b.municipality.province?.name ?? b.municipality.region.name,
        }
      : null,
    municipality: m ? { code: m.code, name: m.name, province: m.province?.name ?? m.region.name } : null,
    office: u.office ? { id: u.office.id, name: u.office.name, acronym: u.office.acronym } : null,
  };
});

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const hours = (await getSettings()).sessionHours;
  const expiresAt = new Date(Date.now() + hours * 3600_000);
  await db.session.create({
    data: {
      id: hashToken(token),
      userId,
      expiresAt,
      ip: clientIp(h),
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** Signs the user out everywhere except (optionally) the current browser. */
export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.session.deleteMany({
    where: { userId, ...(token ? { NOT: { id: hashToken(token) } } : {}) },
  });
}

export function clientIp(h: Headers): string | null {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

/** Who is acting, and which barangay/municipality the audit log entry belongs to. */
export function actorOf(u: AuthUser) {
  return {
    user: { id: u.id, name: u.name },
    barangay: u.barangay ? { code: u.barangay.code, municipalityCode: u.barangay.municipalityCode } : null,
    municipality: u.municipality ? { code: u.municipality.code } : null,
  };
}
