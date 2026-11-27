"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CivilStatus, Education, Relationship, ResidentStatus, Sex, TenureStatus, ToiletType, WaterSource } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { routes } from "@/config/navigation";
import { audit, diff, nextNumber, pad } from "@/server/audit";
import { db } from "@/server/db";
import { bool, date, email, enumOf, fail, ok, opt, optInt, optMoney, parse, phone, req } from "@/server/forms";
import { authorize, refreshDashboard } from "./shared";

const residentSchema = z
  .object({
    firstName: req("First name", 80),
    middleName: opt(80),
    lastName: req("Last name", 80),
    suffix: opt(10),
    sex: enumOf(Sex, "Sex"),
    birthDate: date("Birth date"),
    birthPlace: opt(120),
    civilStatus: enumOf(CivilStatus, "Civil status"),
    citizenship: opt(60),
    religion: opt(60),
    occupation: opt(80),
    education: enumOf(Education, "Education").optional(),
    contactNumber: phone,
    email,
    philsysNo: z.string().regex(/^[0-9-]{12,19}$/, "Enter the 12 or 16-digit PhilSys number.").optional(),
    purokId: opt(40),
    address: req("House no. and street", 200),
    residentSince: optInt(1900, 2100),
    householdId: opt(40),
    relationship: enumOf(Relationship, "Relationship").optional(),
    isRegisteredVoter: bool,
    voterPrecinct: opt(20),
    isPwd: bool,
    disability: opt(120),
    isSoloParent: bool,
    is4Ps: bool,
    isIndigenous: bool,
    isOfw: bool,
    isOutOfSchoolYouth: bool,
    seniorIdNo: opt(40),
    status: enumOf(ResidentStatus, "Status").optional(),
    remarks: opt(1000),
  })
  .superRefine((v, ctx) => {
    const now = new Date();
    if (v.birthDate > now) ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Birth date cannot be in the future." });
    if (v.birthDate.getUTCFullYear() < now.getUTCFullYear() - 125) ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Check the birth year." });
    if (v.householdId && !v.relationship) ctx.addIssue({ code: "custom", path: ["relationship"], message: "Choose the relationship to the household head." });
    if (v.residentSince && v.residentSince > now.getUTCFullYear()) ctx.addIssue({ code: "custom", path: ["residentSince"], message: "Year cannot be in the future." });
    if (v.isPwd && !v.disability) ctx.addIssue({ code: "custom", path: ["disability"], message: "Describe the disability." });
  });

type ResidentInput = z.infer<typeof residentSchema>;

/** Checks that the purok and household belong to this barangay, and there is only one household head. */
async function checkLinks(code: string, v: ResidentInput, selfId?: string): Promise<ActionState | null> {
  if (v.purokId && !(await db.purok.findFirst({ where: { id: v.purokId, barangayCode: code } }))) return fail("Choose a purok from the list.", { purokId: "Choose a purok from the list." });
  if (v.householdId) {
    const h = await db.household.findFirst({ where: { id: v.householdId, barangayCode: code, deletedAt: null } });
    if (!h) return fail("Choose a household from the list.", { householdId: "Choose a household from the list." });
    if (v.relationship === "HEAD") {
      const head = await db.resident.findFirst({ where: { householdId: v.householdId, relationship: "HEAD", deletedAt: null, status: "ACTIVE", ...(selfId ? { NOT: { id: selfId } } : {}) } });
      if (head) return fail(`${h.householdNo} already has a head (${head.firstName} ${head.lastName}). Change that member first.`, { relationship: "This household already has a head." });
    }
  }
  return null;
}

const residentData = (v: ResidentInput) => ({
  firstName: v.firstName,
  middleName: v.middleName ?? null,
  lastName: v.lastName,
  suffix: v.suffix ?? null,
  sex: v.sex,
  birthDate: v.birthDate,
  birthPlace: v.birthPlace ?? null,
  civilStatus: v.civilStatus,
  citizenship: v.citizenship ?? "Filipino",
  religion: v.religion ?? null,
  occupation: v.occupation ?? null,
  education: v.education ?? null,
  contactNumber: v.contactNumber ?? null,
  email: v.email ?? null,
  philsysNo: v.philsysNo ?? null,
  purokId: v.purokId ?? null,
  address: v.address,
  residentSince: v.residentSince ?? null,
  householdId: v.householdId ?? null,
  relationship: v.householdId ? (v.relationship ?? null) : null,
  isRegisteredVoter: v.isRegisteredVoter,
  voterPrecinct: v.isRegisteredVoter ? (v.voterPrecinct ?? null) : null,
  isPwd: v.isPwd,
  disability: v.isPwd ? (v.disability ?? null) : null,
  isSoloParent: v.isSoloParent,
  is4Ps: v.is4Ps,
  isIndigenous: v.isIndigenous,
  isOfw: v.isOfw,
  isOutOfSchoolYouth: v.isOutOfSchoolYouth,
  seniorIdNo: v.seniorIdNo ?? null,
  remarks: v.remarks ?? null,
});

export async function createResident(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(residentSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const bad = await checkLinks(code, v);
  if (bad) return bad;

  const dup = await db.resident.findFirst({
    where: { barangayCode: code, deletedAt: null, birthDate: v.birthDate, firstName: { equals: v.firstName, mode: "insensitive" }, lastName: { equals: v.lastName, mode: "insensitive" } },
  });
  if (dup && fd.get("allowDuplicate") !== "on")
    return fail(`${dup.firstName} ${dup.lastName} (${dup.residentNo}) has the same name and birth date. Tick "This is a different person" to register anyway.`, {
      allowDuplicate: "Confirm this is a different person.",
    });

  const created = await db.$transaction(async (tx) => {
    const n = await nextNumber(tx, code, "resident");
    const r = await tx.resident.create({ data: { ...residentData(v), barangayCode: code, residentNo: `R-${pad(n, 5)}`, createdById: session.user.id } });
    await audit(session, { action: "CREATE", entityType: "Resident", entityId: r.id, summary: `Registered resident ${r.firstName} ${r.lastName} (${r.residentNo})` }, tx);
    return r;
  });
  refreshDashboard();
  redirect(`${routes.residents}/${created.id}?saved=created`);
}

export async function updateResident(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("id") ?? "");
  const before = await db.resident.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!before) return fail("This resident no longer exists.");
  const p = parse(residentSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const bad = await checkLinks(session.barangay.code, v, id);
  if (bad) return bad;

  const data = { ...residentData(v), status: v.status ?? before.status, ...(v.householdId !== before.householdId ? { familyId: null } : {}) };
  const changes = diff(before as unknown as Record<string, unknown>, data);
  await db.$transaction(async (tx) => {
    await tx.resident.update({ where: { id }, data });
    if (Object.keys(changes).length)
      await audit(session, { action: "UPDATE", entityType: "Resident", entityId: id, summary: `Updated resident ${v.firstName} ${v.lastName} (${before.residentNo})`, changes }, tx);
  });
  refreshDashboard();
  redirect(`${routes.residents}/${id}?saved=updated`);
}

/** Archive (soft delete). The record stays for documents and cases that refer to it. */
export async function archiveResident(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 5) return fail("Give a short reason for archiving.", { reason: "Give a short reason." });
  const r = await db.resident.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!r) return fail("This resident no longer exists.");
  await db.$transaction(async (tx) => {
    await tx.resident.update({ where: { id }, data: { deletedAt: new Date(), householdId: null, familyId: null, relationship: null } });
    await audit(session, { action: "DELETE", entityType: "Resident", entityId: id, summary: `Archived resident ${r.firstName} ${r.lastName} (${r.residentNo}): ${reason}` }, tx);
  });
  refreshDashboard();
  redirect(`${routes.residents}?saved=archived`);
}

// ───────── Households ─────────

const householdSchema = z.object({
  purokId: req("Purok", 40),
  address: req("House no. and street", 200),
  tenure: enumOf(TenureStatus, "Tenure"),
  waterSource: enumOf(WaterSource, "Water source"),
  toilet: enumOf(ToiletType, "Toilet facility"),
  hasElectricity: bool,
  monthlyIncome: optMoney,
  remarks: opt(1000),
});

export async function createHousehold(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(householdSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  if (!(await db.purok.findFirst({ where: { id: v.purokId, barangayCode: code } }))) return fail("Choose a purok from the list.", { purokId: "Choose a purok." });
  const h = await db.$transaction(async (tx) => {
    const n = await nextNumber(tx, code, "household");
    const h = await tx.household.create({ data: { ...v, monthlyIncome: v.monthlyIncome ?? null, remarks: v.remarks ?? null, barangayCode: code, householdNo: `HH-${pad(n)}` } });
    await tx.family.create({ data: { barangayCode: code, householdId: h.id, name: "Primary family" } });
    await audit(session, { action: "CREATE", entityType: "Household", entityId: h.id, summary: `Added household ${h.householdNo} at ${h.address}` }, tx);
    return h;
  });
  refreshDashboard();
  redirect(`${routes.households}/${h.id}?saved=created`);
}

export async function updateHousehold(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("id") ?? "");
  const before = await db.household.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null } });
  if (!before) return fail("This household no longer exists.");
  const p = parse(householdSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  if (!(await db.purok.findFirst({ where: { id: v.purokId, barangayCode: session.barangay.code } }))) return fail("Choose a purok from the list.", { purokId: "Choose a purok." });
  const data = { ...v, monthlyIncome: v.monthlyIncome ?? null, remarks: v.remarks ?? null };
  const changes = diff(before as unknown as Record<string, unknown>, data);
  await db.$transaction(async (tx) => {
    await tx.household.update({ where: { id }, data });
    // Members' address follows the household.
    if (changes.address || changes.purokId) await tx.resident.updateMany({ where: { householdId: id }, data: { address: v.address, purokId: v.purokId } });
    if (Object.keys(changes).length) await audit(session, { action: "UPDATE", entityType: "Household", entityId: id, summary: `Updated household ${before.householdNo}`, changes }, tx);
  });
  refreshDashboard();
  redirect(`${routes.households}/${id}?saved=updated`);
}

export async function deleteHousehold(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("id") ?? "");
  const h = await db.household.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null }, include: { _count: { select: { members: { where: { deletedAt: null } } } } } });
  if (!h) return fail("This household no longer exists.");
  if (h._count.members > 0) return fail("Move or remove every member first. A household with members cannot be removed.");
  await db.$transaction(async (tx) => {
    await tx.household.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(session, { action: "DELETE", entityType: "Household", entityId: id, summary: `Removed empty household ${h.householdNo}` }, tx);
  });
  refreshDashboard();
  redirect(`${routes.households}?saved=deleted`);
}

/** Puts an existing resident into this household (moving them from another one if needed). */
export async function addHouseholdMember(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(z.object({ householdId: req("Household", 40), residentId: req("Resident", 40), relationship: enumOf(Relationship, "Relationship"), familyId: opt(40) }), fd);
  if (!p.ok) return p.state;
  const { householdId, residentId, relationship, familyId } = p.data;
  const code = session.barangay.code;
  const [h, r] = await Promise.all([
    db.household.findFirst({ where: { id: householdId, barangayCode: code, deletedAt: null } }),
    db.resident.findFirst({ where: { id: residentId, barangayCode: code, deletedAt: null } }),
  ]);
  if (!h || !r) return fail("Choose a resident from the list.", { residentId: "Choose a resident." });
  if (relationship === "HEAD") {
    const head = await db.resident.findFirst({ where: { householdId, relationship: "HEAD", deletedAt: null, status: "ACTIVE", NOT: { id: residentId } } });
    if (head) return fail(`This household already has a head (${head.firstName} ${head.lastName}).`, { relationship: "Already has a head." });
  }
  if (familyId && !(await db.family.findFirst({ where: { id: familyId, householdId } }))) return fail("Choose a family from this household.");
  await db.$transaction(async (tx) => {
    await tx.resident.update({ where: { id: residentId }, data: { householdId, relationship, familyId: familyId ?? null, address: h.address, purokId: h.purokId } });
    await audit(
      session,
      { action: "UPDATE", entityType: "Resident", entityId: residentId, summary: `Added ${r.firstName} ${r.lastName} to household ${h.householdNo}`, changes: { householdId: [r.householdId, householdId] } },
      tx,
    );
  });
  refreshDashboard();
  return ok(`${r.firstName} ${r.lastName} was added to ${h.householdNo}.`);
}

export async function removeHouseholdMember(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("residentId") ?? "");
  const r = await db.resident.findFirst({ where: { id, barangayCode: session.barangay.code, deletedAt: null }, include: { household: true } });
  if (!r?.household) return fail("This member is no longer in the household.");
  await db.$transaction(async (tx) => {
    await tx.resident.update({ where: { id }, data: { householdId: null, familyId: null, relationship: null } });
    await audit(session, { action: "UPDATE", entityType: "Resident", entityId: id, summary: `Removed ${r.firstName} ${r.lastName} from household ${r.household!.householdNo}` }, tx);
  });
  refreshDashboard();
  return ok("Member removed from the household.");
}

// ───────── Families ─────────

export async function createFamily(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(z.object({ householdId: req("Household", 40), name: req("Family name", 80) }), fd);
  if (!p.ok) return p.state;
  const h = await db.household.findFirst({ where: { id: p.data.householdId, barangayCode: session.barangay.code, deletedAt: null } });
  if (!h) return fail("Choose a household from the list.", { householdId: "Choose a household." });
  await db.$transaction(async (tx) => {
    const f = await tx.family.create({ data: { barangayCode: session.barangay.code, householdId: h.id, name: p.data.name } });
    await audit(session, { action: "CREATE", entityType: "Family", entityId: f.id, summary: `Added the ${f.name} to household ${h.householdNo}` }, tx);
  });
  refreshDashboard();
  return ok(`Family added to ${h.householdNo}.`);
}

export async function renameFamily(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const p = parse(z.object({ id: req("Family", 40), name: req("Family name", 80) }), fd);
  if (!p.ok) return p.state;
  const f = await db.family.findFirst({ where: { id: p.data.id, barangayCode: session.barangay.code } });
  if (!f) return fail("This family no longer exists.");
  await db.$transaction(async (tx) => {
    await tx.family.update({ where: { id: f.id }, data: { name: p.data.name } });
    await audit(session, { action: "UPDATE", entityType: "Family", entityId: f.id, summary: `Renamed family to ${p.data.name}`, changes: { name: [f.name, p.data.name] } }, tx);
  });
  refreshDashboard();
  return ok("Family renamed.");
}

export async function deleteFamily(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const id = String(fd.get("id") ?? "");
  const f = await db.family.findFirst({ where: { id, barangayCode: session.barangay.code }, include: { _count: { select: { members: true } } } });
  if (!f) return fail("This family no longer exists.");
  if (f._count.members > 0) return fail("Move the members to another family first.");
  await db.$transaction(async (tx) => {
    await tx.family.delete({ where: { id } });
    await audit(session, { action: "DELETE", entityType: "Family", entityId: id, summary: `Removed the empty ${f.name}` }, tx);
  });
  refreshDashboard();
  return ok("Family removed.");
}

export async function assignFamily(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("residents:manage");
  const residentId = String(fd.get("residentId") ?? "");
  const familyId = String(fd.get("familyId") ?? "") || null;
  const r = await db.resident.findFirst({ where: { id: residentId, barangayCode: session.barangay.code, deletedAt: null } });
  if (!r?.householdId) return fail("Add this resident to a household first.");
  if (familyId && !(await db.family.findFirst({ where: { id: familyId, householdId: r.householdId } }))) return fail("Choose a family in the same household.");
  await db.resident.update({ where: { id: residentId }, data: { familyId } });
  await audit(session, { action: "UPDATE", entityType: "Resident", entityId: residentId, summary: `Changed family of ${r.firstName} ${r.lastName}` });
  refreshDashboard();
  return ok("Family updated.");
}
