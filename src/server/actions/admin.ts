"use server";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth/staff";
import { audit } from "@/server/audit";
import { db } from "@/server/db";
import { prepareBarangay } from "@/server/onboarding";
import { bool, fail, int, ok, opt, parse, req } from "@/server/forms";
import { isUnique, refreshDashboard } from "./shared";

export async function onboardBarangay(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const p = parse(z.object({ code: req("Barangay", 10), purokCount: int("Number of puroks", 1, 40) }), fd);
  if (!p.ok) return p.state;
  const b = await db.barangay.findFirst({ where: { code: p.data.code, municipalityCode: u.municipality!.code } });
  if (!b) return fail("This barangay is not in your municipality.");
  await db.$transaction(async (tx) => {
    const made = await prepareBarangay(tx, b.code, p.data.purokCount);
    const parts = [made.puroks && `${p.data.purokCount} puroks`, made.types && "default document types", made.bodies && "default councils"].filter(Boolean);
    await audit(u.actor, { action: "UPDATE", entityType: "Barangay", entityId: b.code, summary: `Onboarded Barangay ${b.name}${parts.length ? ` (added ${parts.join(", ")})` : ""}` }, tx);
  });
  refreshDashboard();
  return ok(`Barangay ${b.name} is active. Create its secretary account next.`);
}

export async function deactivateBarangay(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 5) return fail("Give the reason.", { reason: "Give a reason." });
  const b = await db.barangay.findFirst({ where: { code: String(fd.get("code") ?? ""), municipalityCode: u.municipality!.code } });
  if (!b) return fail("This barangay is not in your municipality.");
  await db.$transaction(async (tx) => {
    await tx.barangay.update({ where: { code: b.code }, data: { isActive: false } });
    // Its secretaries can no longer sign in; sign them out now.
    await tx.session.deleteMany({ where: { user: { barangayCode: b.code } } });
    await audit(u.actor, { action: "UPDATE", entityType: "Barangay", entityId: b.code, summary: `Deactivated Barangay ${b.name}: ${reason}` }, tx);
  });
  refreshDashboard();
  return ok(`Barangay ${b.name} was deactivated. Its records are kept.`);
}

const officeSchema = z.object({ name: req("Office name", 160), acronym: opt(20), isActive: bool });

export async function saveOffice(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const id = String(fd.get("id") ?? "");
  const p = parse(officeSchema, fd);
  if (!p.ok) return p.state;
  const code = u.municipality!.code;
  const data = { name: p.data.name, acronym: p.data.acronym?.toUpperCase() ?? null, isActive: id ? p.data.isActive : true };
  try {
    await db.$transaction(async (tx) => {
      if (id) {
        const o = await tx.municipalOffice.findFirst({ where: { id, municipalityCode: code } });
        if (!o) throw new Error("not found");
        await tx.municipalOffice.update({ where: { id }, data });
        await audit(u.actor, { action: "UPDATE", entityType: "MunicipalOffice", entityId: id, summary: `Updated office ${data.name}${o.isActive !== data.isActive ? (data.isActive ? " (reactivated)" : " (deactivated)") : ""}` }, tx);
      } else {
        const o = await tx.municipalOffice.create({ data: { ...data, municipalityCode: code } });
        await audit(u.actor, { action: "CREATE", entityType: "MunicipalOffice", entityId: o.id, summary: `Added office ${data.name}` }, tx);
      }
    });
  } catch (e) {
    if (isUnique(e)) return fail("An office with this name already exists.", { name: "Already exists." });
    throw e;
  }
  refreshDashboard();
  return ok(id ? "Office updated." : "Office added.");
}
