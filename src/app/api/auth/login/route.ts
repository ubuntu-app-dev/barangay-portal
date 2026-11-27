import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Role } from "@/generated/prisma/enums";
import { clientIp, createSession, fullName, ROLE_HOME } from "@/server/auth";
import { db } from "@/server/db";
import { verifyPassword } from "@/server/password";
import { hit, tooMany } from "@/server/rate-limit";

const code = z.string().regex(/^\d{9,10}$/).optional();
const Body = z.object({
  role: z.enum(["secretary", "municipal", "superadmin"]),
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
  location: z
    .object({ regionCode: code, provinceCode: code, municipalityCode: code, barangayCode: code })
    .default({}),
});

const MAX_FAILURES = 5;
/** Failed attempts allowed per IP address in the window, across all accounts. */
const IP_LIMIT = 20;
const IP_WINDOW = 15 * 60_000;
const LOCK_MINUTES = 15;
const GENERIC = "Incorrect username or password for this location.";

/** Which database roles each sign-in page accepts. The municipal page serves personnel and the municipal IT admin. */
const ACCEPTS: Record<z.infer<typeof Body>["role"], Role[]> = {
  secretary: ["BARANGAY_SECRETARY"],
  municipal: ["MUNICIPAL_PERSONNEL", "MUNICIPAL_ADMIN"],
  superadmin: ["SUPERADMIN"],
};

const fail = (message: string, status = 401) => NextResponse.json({ message }, { status });

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Enter your username and password.", 400);
  const { role, username, password, location } = parsed.data;
  const ip = clientIp(await headers());
  const ipKey = `login:${ip ?? "unknown"}`;
  if (tooMany(ipKey, IP_LIMIT, IP_WINDOW)) return fail("Too many sign-in attempts from this network. Wait 15 minutes and try again.", 429);

  const user = await db.user.findFirst({
    where: { OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: username, mode: "insensitive" } }] },
    include: { barangay: true, municipality: true },
  });

  // Same message whether the account exists or not, so usernames cannot be probed.
  if (!user) {
    hit(ipKey);
    // Logged so administrators can spot password guessing against made-up usernames.
    const munCode = location.municipalityCode?.padStart(10, "0");
    const known = munCode ? await db.municipality.findUnique({ where: { code: munCode }, select: { code: true } }) : null;
    await db.auditLog.create({
      data: { actorName: `Unknown username "${username.slice(0, 40)}"`, action: "LOGIN_FAILED", entityType: "User", summary: "Sign-in with a username that does not exist", municipalityCode: known?.code ?? null, ip },
    });
    await new Promise((r) => setTimeout(r, 300));
    return fail(GENERIC);
  }
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now())
    return fail(`Too many failed attempts. Try again after ${LOCK_MINUTES} minutes or ask your administrator.`, 429);

  const passwordOk = await verifyPassword(password, user.passwordHash);
  const scopeOk =
    ACCEPTS[role].includes(user.role) &&
    (role === "secretary"
      ? !!location.barangayCode && user.barangayCode === location.barangayCode.padStart(10, "0")
      : role === "municipal"
        ? !!location.municipalityCode && user.municipalityCode === location.municipalityCode.padStart(10, "0")
        : true);

  const log = (action: "LOGIN" | "LOGIN_FAILED", summary: string) =>
    db.auditLog.create({
      data: {
        actorId: user.id,
        actorName: fullName(user),
        action,
        entityType: "User",
        entityId: user.id,
        summary,
        barangayCode: user.barangayCode,
        municipalityCode: user.municipalityCode ?? user.barangay?.municipalityCode ?? null,
        ip,
      },
    });

  if (!passwordOk || !scopeOk) {
    hit(ipKey);
    const failures = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLogins: failures >= MAX_FAILURES ? 0 : failures,
        lockedUntil: failures >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    await log("LOGIN_FAILED", passwordOk ? "Signed in from the wrong location or role page" : "Wrong password");
    return fail(GENERIC);
  }
  if (user.status !== "ACTIVE") return fail("This account is not active. Contact your municipal IT administrator.", 403);
  // A deactivated barangay or municipality cannot be used, even with a valid account.
  const munCode = user.municipalityCode ?? user.barangay?.municipalityCode;
  const mun = munCode ? await db.municipality.findUnique({ where: { code: munCode }, select: { isActive: true } }) : null;
  if ((user.barangay && !user.barangay.isActive) || (mun && !mun.isActive))
    return fail(user.barangay && !user.barangay.isActive ? "This barangay is not active on LGU Connect. Contact your municipal IT administrator." : "This municipality is not active on LGU Connect. Contact the system administrator.", 403);

  await db.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await createSession(user.id);
  await log("LOGIN", "Signed in");
  return NextResponse.json({ redirectTo: ROLE_HOME[user.role] });
}
