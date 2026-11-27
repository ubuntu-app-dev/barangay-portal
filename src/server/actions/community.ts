"use server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { AnimalStatus, Condition, ResourceCategory, Sex, Species, WaterSource } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { nameFull } from "@/lib/dashboard/format";
import { SPECIES, WATER_SHORT, label } from "@/lib/labels";
import { audit, diff, nextNumber, pad } from "@/server/audit";
import { db } from "@/server/db";
import { enumOf, fail, int, ok, opt, optDate, optInt, optMoney, parse, req } from "@/server/forms";
import { authorize, refreshDashboard } from "./shared";

// ───────── Animals ─────────

const animalSchema = z.object({
  species: enumOf(Species, "Species"),
  name: opt(60),
  breed: opt(60),
  sex: enumOf(Sex, "Sex").optional(),
  color: opt(40),
  birthYear: optInt(1980, 2100),
  ownerResidentId: opt(40),
  ownerName: opt(120),
  lastVaccinatedAt: optDate,
  vaccine: opt(80),
  status: enumOf(AnimalStatus, "Status").optional(),
  remarks: opt(1000),
});

export async function saveAnimal(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("resources:manage");
  const id = String(fd.get("id") ?? "");
  const p = parse(animalSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  if (v.lastVaccinatedAt && v.lastVaccinatedAt > new Date()) return fail("The vaccination date cannot be in the future.", { lastVaccinatedAt: "Cannot be in the future." });
  let owner: { id: string; name: string; householdId: string | null } | null = null;
  if (v.ownerResidentId) {
    const r = await db.resident.findFirst({ where: { id: v.ownerResidentId, barangayCode: code, deletedAt: null } });
    if (!r) return fail("Choose the owner from the list.", { ownerResidentId: "Choose a resident." });
    owner = { id: r.id, name: nameFull(r), householdId: r.householdId };
  }
  if (!owner && !v.ownerName) return fail("Pick the owner, or type their name if they are not a resident.", { ownerName: "Required." });
  const data = {
    species: v.species,
    name: v.name ?? null,
    breed: v.breed ?? null,
    sex: v.sex ?? null,
    color: v.color ?? null,
    birthYear: v.birthYear ?? null,
    ownerResidentId: owner?.id ?? null,
    ownerName: owner?.name ?? v.ownerName!,
    householdId: owner?.householdId ?? null,
    lastVaccinatedAt: v.lastVaccinatedAt ?? null,
    vaccine: v.vaccine ?? null,
    remarks: v.remarks ?? null,
  };
  await db.$transaction(async (tx) => {
    if (id) {
      const before = await tx.animal.findFirst({ where: { id, barangayCode: code, deletedAt: null } });
      if (!before) throw new Error("not found");
      const next = { ...data, status: v.status ?? before.status };
      await tx.animal.update({ where: { id }, data: next });
      await audit(session, { action: "UPDATE", entityType: "Animal", entityId: id, summary: `Updated animal ${before.tagNo}`, changes: diff(before as unknown as Record<string, unknown>, next) }, tx);
    } else {
      const n = await nextNumber(tx, code, "animal");
      const a = await tx.animal.create({ data: { ...data, barangayCode: code, tagNo: `AN-${pad(n)}` } });
      await audit(session, { action: "CREATE", entityType: "Animal", entityId: a.id, summary: `Registered ${label(SPECIES, v.species).toLowerCase()} ${a.tagNo}${v.name ? ` (${v.name})` : ""} of ${data.ownerName}` }, tx);
    }
  });
  refreshDashboard();
  return ok(id ? "Animal record updated." : "Animal registered.");
}

export async function recordVaccination(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("resources:manage");
  const p = parse(z.object({ id: req("Animal", 40), lastVaccinatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date.").transform((s) => new Date(`${s}T00:00:00Z`)), vaccine: req("Vaccine", 80) }), fd);
  if (!p.ok) return p.state;
  if (p.data.lastVaccinatedAt > new Date()) return fail("The date cannot be in the future.", { lastVaccinatedAt: "Cannot be in the future." });
  const a = await db.animal.findFirst({ where: { id: p.data.id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!a) return fail("This animal record no longer exists.");
  await db.$transaction(async (tx) => {
    await tx.animal.update({ where: { id: a.id }, data: { lastVaccinatedAt: p.data.lastVaccinatedAt, vaccine: p.data.vaccine } });
    await audit(session, { action: "UPDATE", entityType: "Animal", entityId: a.id, summary: `Recorded ${p.data.vaccine} vaccination for ${a.tagNo}` }, tx);
  });
  refreshDashboard();
  return ok("Vaccination recorded.");
}

export async function deleteAnimal(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("resources:manage");
  const id = String(fd.get("id") ?? "");
  const a = await db.animal.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!a) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.animal.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(session, { action: "DELETE", entityType: "Animal", entityId: id, summary: `Removed animal record ${a.tagNo}` }, tx);
  });
  refreshDashboard();
  return ok("Animal record removed.");
}

// ───────── Water service ─────────

export async function setWaterSource(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(z.object({ id: req("Household", 40), waterSource: enumOf(WaterSource, "Water source") }), fd);
  if (!p.ok) return p.state;
  const h = await db.household.findFirst({ where: { id: p.data.id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!h) return fail("This household no longer exists.");
  if (h.waterSource === p.data.waterSource) return ok("No change.");
  await db.$transaction(async (tx) => {
    await tx.household.update({ where: { id: h.id }, data: { waterSource: p.data.waterSource } });
    await audit(session, { action: "UPDATE", entityType: "Household", entityId: h.id, summary: `Changed water source of ${h.householdNo}`, changes: { waterSource: [label(WATER_SHORT, h.waterSource), label(WATER_SHORT, p.data.waterSource)] } }, tx);
  });
  refreshDashboard();
  return ok("Water source updated.");
}

// ───────── Community resources ─────────

const resourceSchema = z.object({
  name: req("Name", 160),
  category: enumOf(ResourceCategory, "Category"),
  quantity: int("Quantity", 0, 1_000_000),
  unit: req("Unit", 30),
  condition: enumOf(Condition, "Condition"),
  location: opt(200),
  custodian: opt(120),
  acquiredAt: optDate,
  value: optMoney,
  remarks: opt(1000),
});

export async function saveResource(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("resources:manage");
  const id = String(fd.get("id") ?? "");
  const p = parse(resourceSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const data = { ...v, location: v.location ?? null, custodian: v.custodian ?? null, acquiredAt: v.acquiredAt ?? null, value: v.value !== undefined ? new Prisma.Decimal(v.value) : null, remarks: v.remarks ?? null };
  await db.$transaction(async (tx) => {
    if (id) {
      const before = await tx.communityResource.findFirst({ where: { id, barangayCode: code, deletedAt: null } });
      if (!before) throw new Error("not found");
      await tx.communityResource.update({ where: { id }, data });
      await audit(session, { action: "UPDATE", entityType: "CommunityResource", entityId: id, summary: `Updated resource ${v.name}`, changes: diff(before as unknown as Record<string, unknown>, data) }, tx);
    } else {
      const r = await tx.communityResource.create({ data: { ...data, barangayCode: code } });
      await audit(session, { action: "CREATE", entityType: "CommunityResource", entityId: r.id, summary: `Added resource ${v.name} (${v.quantity} ${v.unit})` }, tx);
    }
  });
  refreshDashboard();
  return ok(id ? "Resource updated." : "Resource added.");
}

export async function deleteResource(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("resources:manage");
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 3) return fail("Give the reason (disposed, donated, lost…).", { reason: "Give a reason." });
  const r = await db.communityResource.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!r) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.communityResource.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(session, { action: "DELETE", entityType: "CommunityResource", entityId: id, summary: `Removed ${r.name} from the inventory: ${reason}` }, tx);
  });
  refreshDashboard();
  return ok("Removed from the inventory.");
}
