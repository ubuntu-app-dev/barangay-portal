"use server";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { audit } from "@/server/audit";
import { destroyOtherSessions } from "@/server/auth";
import { db } from "@/server/db";
import { bool, email, fail, ok, opt, parse, phone, req } from "@/server/forms";
import { hashPassword, passwordProblem, verifyPassword } from "@/server/password";
import { requireUser } from "@/lib/auth/staff";
import { getSettings } from "@/server/settings";
import { isUnique, refreshDashboard } from "./shared";

export async function updateAccount(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireUser();
  const session = u.actor;
  const p = parse(z.object({ firstName: req("First name", 80), middleName: opt(80), lastName: req("Last name", 80), suffix: opt(10), email, phone }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  try {
    await db.user.update({ where: { id: session.user.id }, data: { firstName: v.firstName, middleName: v.middleName ?? null, lastName: v.lastName, suffix: v.suffix ?? null, email: v.email?.toLowerCase() ?? null, phone: v.phone ?? null } });
  } catch (e) {
    if (isUnique(e)) return fail("Another account already uses this email.", { email: "Already in use." });
    throw e;
  }
  await audit(session, { action: "UPDATE", entityType: "User", entityId: session.user.id, summary: "Updated own account details" });
  refreshDashboard();
  return ok("Your details were saved.");
}

export async function changePassword(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireUser();
  const session = u.actor;
  const p = parse(z.object({ current: req("Current password", 200), next: req("New password", 200), confirm: req("Confirmation", 200), signOutOthers: bool }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!(await verifyPassword(v.current, user.passwordHash))) return fail("Your current password is not correct.", { current: "Not correct." });
  const problem = passwordProblem(v.next, (await getSettings()).passwordMinLength);
  if (problem) return fail(problem, { next: problem });
  if (v.next !== v.confirm) return fail("The new passwords do not match.", { confirm: "Does not match." });
  if (v.next === v.current) return fail("Choose a password different from the current one.", { next: "Same as the current password." });
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(v.next), passwordChangedAt: new Date(), mustChangePassword: false } });
  if (v.signOutOthers) await destroyOtherSessions(user.id);
  await audit(session, { action: "PASSWORD_CHANGE", entityType: "User", entityId: user.id, summary: `Changed own password${v.signOutOthers ? " and signed out other devices" : ""}` });
  refreshDashboard();
  return ok(v.signOutOthers ? "Password changed. Other devices were signed out." : "Password changed.");
}

export async function savePreferences(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireUser();
  const session = u.actor;
  const p = parse(z.object({ requests: bool, submissions: bool, deadlines: bool, announcements: bool, advisories: bool, email: bool }), fd);
  if (!p.ok) return p.state;
  await db.user.update({ where: { id: session.user.id }, data: { preferences: p.data } });
  await audit(session, { action: "UPDATE", entityType: "User", entityId: session.user.id, summary: "Updated notification preferences" });
  return ok("Preferences saved.");
}

export async function signOutOtherDevices(): Promise<ActionState> {
  const u = await requireUser();
  const session = u.actor;
  await destroyOtherSessions(session.user.id);
  await audit(session, { action: "LOGOUT", entityType: "User", entityId: session.user.id, summary: "Signed out all other devices" });
  refreshDashboard();
  return ok("Other devices were signed out.");
}
