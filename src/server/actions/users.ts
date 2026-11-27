"use server";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { requireRole, type StaffSession } from "@/lib/auth/staff";
import { audit } from "@/server/audit";
import { fullName } from "@/server/auth";
import { db } from "@/server/db";
import { bool, email, enumOf, fail, ok, opt, parse, phone, req } from "@/server/forms";
import { hashPassword, temporaryPassword } from "@/server/password";
import { manageableRoles, ROLE_LABEL, userScope } from "@/server/queries/users";
import { isUnique, refreshDashboard } from "./shared";

const managers = () => requireRole("MUNICIPAL_ADMIN", "SUPERADMIN");

/** Loads a user the actor may manage, or null. */
async function target(actor: StaffSession, id: string) {
  return db.user.findFirst({ where: { AND: [{ id }, userScope(actor)] } });
}

/** Checks the scope fields for a role and returns what to store. */
async function scopeFor(actor: StaffSession, role: Role, v: { barangayCode?: string; officeId?: string; municipalityCode?: string }) {
  if (!manageableRoles(actor).includes(role)) return { error: "You cannot manage this kind of account." };
  const mun = actor.role === "SUPERADMIN" ? undefined : actor.municipality!.code;
  if (role === "BARANGAY_SECRETARY") {
    const b = v.barangayCode ? await db.barangay.findFirst({ where: { code: v.barangayCode, isActive: true, ...(mun ? { municipalityCode: mun } : {}) } }) : null;
    if (!b) return { error: "Choose an onboarded barangay.", field: "barangayCode" };
    return { data: { barangayCode: b.code, municipalityCode: null, officeId: null } };
  }
  if (role === "MUNICIPAL_PERSONNEL") {
    const o = v.officeId ? await db.municipalOffice.findFirst({ where: { id: v.officeId, isActive: true, ...(mun ? { municipalityCode: mun } : {}) } }) : null;
    if (!o) return { error: "Choose the office this person works in.", field: "officeId" };
    return { data: { barangayCode: null, municipalityCode: o.municipalityCode, officeId: o.id } };
  }
  if (role === "MUNICIPAL_ADMIN") {
    const m = v.municipalityCode ? await db.municipality.findUnique({ where: { code: v.municipalityCode } }) : null;
    if (!m) return { error: "Choose the municipality this administrator manages.", field: "municipalityCode" };
    const it = await db.municipalOffice.findFirst({ where: { municipalityCode: m.code, acronym: "MITO" } });
    return { data: { barangayCode: null, municipalityCode: m.code, officeId: it?.id ?? null } };
  }
  return { data: { barangayCode: null, municipalityCode: null, officeId: null } };
}

const accountSchema = z.object({
  role: enumOf(Role, "Role"),
  firstName: req("First name", 80),
  middleName: opt(80),
  lastName: req("Last name", 80),
  position: opt(120),
  email,
  phone,
  barangayCode: opt(10),
  officeId: opt(40),
  municipalityCode: opt(10),
  vawc: bool,
});

export async function createUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await managers();
  const p = parse(accountSchema.extend({ username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{4,40}$/, "Use 4 to 40 letters, numbers, dots, dashes, or underscores.") }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const scope = await scopeFor(actor, v.role, v);
  if ("error" in scope) return fail(scope.error!, scope.field ? { [scope.field]: scope.error! } : undefined);
  const password = temporaryPassword();
  try {
    await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          username: v.username,
          email: v.email?.toLowerCase() ?? null,
          passwordHash: await hashPassword(password),
          role: v.role,
          firstName: v.firstName,
          middleName: v.middleName ?? null,
          lastName: v.lastName,
          position: v.position ?? ROLE_LABEL[v.role],
          phone: v.phone ?? null,
          ...scope.data,
          permissions: v.role === "BARANGAY_SECRETARY" && v.vawc ? ["vawc:view"] : [],
          mustChangePassword: true,
          createdById: actor.id,
        },
      });
      await audit(actor.actor, { action: "CREATE", entityType: "User", entityId: u.id, summary: `Created ${ROLE_LABEL[v.role]} account ${u.username} for ${fullName(u)}` }, tx);
    });
  } catch (e) {
    if (isUnique(e)) return fail("That username or email is already used.", { username: "Already taken (or the email is)." });
    throw e;
  }
  refreshDashboard();
  return ok(`Account ${v.username} created. Temporary password: ${password} — give it to the person directly. They must change it when they first sign in.`);
}

export async function updateUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await managers();
  const id = String(fd.get("id") ?? "");
  const before = await target(actor, id);
  if (!before) return fail("You cannot manage this account.");
  const p = parse(accountSchema.omit({ role: true }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const scope = await scopeFor(actor, before.role, v);
  if ("error" in scope) return fail(scope.error!, scope.field ? { [scope.field]: scope.error! } : undefined);
  const permissions = before.role === "BARANGAY_SECRETARY" ? [...new Set([...before.permissions.filter((x) => x !== "vawc:view"), ...(v.vawc ? ["vawc:view"] : [])])] : before.permissions;
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { firstName: v.firstName, middleName: v.middleName ?? null, lastName: v.lastName, position: v.position ?? null, email: v.email?.toLowerCase() ?? null, phone: v.phone ?? null, ...scope.data, permissions } });
      const vawcChanged = before.permissions.includes("vawc:view") !== permissions.includes("vawc:view");
      await audit(actor.actor, { action: "UPDATE", entityType: "User", entityId: id, summary: `Updated account ${before.username}${vawcChanged ? (v.vawc ? " and granted VAWC access" : " and removed VAWC access") : ""}` }, tx);
    });
  } catch (e) {
    if (isUnique(e)) return fail("That email is already used by another account.", { email: "Already in use." });
    throw e;
  }
  refreshDashboard();
  return ok("Account updated.");
}

export async function setUserStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await managers();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const reason = String(fd.get("reason") ?? "").trim();
  if (!["ACTIVE", "SUSPENDED", "DEACTIVATED"].includes(status)) return fail("Unknown status.");
  if (id === actor.id) return fail("You cannot change the status of your own account.");
  const u = await target(actor, id);
  if (!u) return fail("You cannot manage this account.");
  if (status !== "ACTIVE" && reason.length < 5) return fail("Give the reason.", { reason: "Give a reason." });
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { status: status as "ACTIVE" | "SUSPENDED" | "DEACTIVATED", ...(status === "ACTIVE" ? { failedLogins: 0, lockedUntil: null } : {}) } });
    if (status !== "ACTIVE") await tx.session.deleteMany({ where: { userId: id } });
    await audit(actor.actor, { action: "UPDATE", entityType: "User", entityId: id, summary: `${status === "ACTIVE" ? "Reactivated" : status === "SUSPENDED" ? "Suspended" : "Deactivated"} account ${u.username}${reason ? `: ${reason}` : ""}` }, tx);
  });
  refreshDashboard();
  return ok(status === "ACTIVE" ? "Account reactivated." : "Account blocked and signed out everywhere.");
}

export async function unlockUser(_: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await managers();
  const u = await target(actor, String(fd.get("id") ?? ""));
  if (!u) return fail("You cannot manage this account.");
  await db.user.update({ where: { id: u.id }, data: { failedLogins: 0, lockedUntil: null } });
  await audit(actor.actor, { action: "UPDATE", entityType: "User", entityId: u.id, summary: `Unlocked account ${u.username}` });
  refreshDashboard();
  return ok("Unlocked. The person can sign in again.");
}

/** New temporary password, shown once to the administrator. Signs the user out everywhere. */
export async function resetUserPassword(id: string): Promise<{ ok: true; password: string } | { ok: false; message: string }> {
  const actor = await managers();
  if (id === actor.id) return { ok: false, message: "Use Change Password for your own account." };
  const u = await target(actor, id);
  if (!u) return { ok: false, message: "You cannot manage this account." };
  const password = temporaryPassword();
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { passwordHash: await hashPassword(password), mustChangePassword: true, failedLogins: 0, lockedUntil: null } });
    await tx.session.deleteMany({ where: { userId: id } });
    await audit(actor.actor, { action: "PASSWORD_RESET", entityType: "User", entityId: id, summary: `Reset the password of ${u.username}` }, tx);
  });
  refreshDashboard();
  return { ok: true, password };
}
