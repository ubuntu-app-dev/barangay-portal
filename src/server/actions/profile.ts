"use server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { Classification } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { audit, diff } from "@/server/audit";
import { db } from "@/server/db";
import { bool, email, enumOf, fail, int, ok, opt, optDate, parse, phone, req } from "@/server/forms";
import { authorize, isUnique, refreshDashboard } from "./shared";

const infoSchema = z.object({
  classification: enumOf(Classification, "Classification"),
  landAreaHectares: z.coerce.number({ error: "Enter a number." }).min(0).max(1_000_000).optional(),
  dateEstablished: optDate,
  zipCode: z.string().regex(/^\d{4}$/, "Enter the 4-digit ZIP code.").optional(),
  legislativeDistrict: opt(120),
  boundaryNorth: opt(120),
  boundaryEast: opt(120),
  boundarySouth: opt(120),
  boundaryWest: opt(120),
  history: opt(5000),
  vision: opt(2000),
  mission: opt(2000),
});

export async function updateBarangayInfo(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const p = parse(infoSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const before = await db.barangay.findUniqueOrThrow({ where: { code } });
  const data = {
    classification: v.classification,
    landAreaHectares: v.landAreaHectares !== undefined ? new Prisma.Decimal(v.landAreaHectares) : null,
    dateEstablished: v.dateEstablished ?? null,
    zipCode: v.zipCode ?? null,
    legislativeDistrict: v.legislativeDistrict ?? null,
    boundaryNorth: v.boundaryNorth ?? null,
    boundaryEast: v.boundaryEast ?? null,
    boundarySouth: v.boundarySouth ?? null,
    boundaryWest: v.boundaryWest ?? null,
    history: v.history ?? null,
    vision: v.vision ?? null,
    mission: v.mission ?? null,
  };
  const changes = diff(before as unknown as Record<string, unknown>, data);
  await db.$transaction(async (tx) => {
    await tx.barangay.update({ where: { code }, data });
    await audit(session, { action: "UPDATE", entityType: "Barangay", entityId: code, summary: "Updated barangay information", changes }, tx);
  });
  refreshDashboard();
  return ok("Barangay information saved.");
}

/** Reads repeated rows like hotlines.0.name, hotlines.0.number … from the form. */
function rows(fd: FormData, prefix: string, fields: string[]) {
  const out: Record<string, string>[] = [];
  for (let i = 0; i < 20; i++) {
    const row: Record<string, string> = {};
    for (const f of fields) row[f] = String(fd.get(`${prefix}.${i}.${f}`) ?? "").trim();
    if (fields.every((f) => !row[f])) continue;
    out.push(row);
  }
  return out;
}

const contactSchema = z.object({
  address: req("Address", 300),
  landline: phone,
  mobile: phone,
  email,
  facebook: opt(200),
});

export async function updateBarangayContacts(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const p = parse(contactSchema, fd);
  if (!p.ok) return p.state;
  const hours = rows(fd, "hours", ["days", "time"]);
  const hotlines = rows(fd, "hotlines", ["name", "number", "note"]);
  if (hours.some((h) => !h.days || !h.time)) return fail("Each office-hours row needs both the days and the time.");
  if (hotlines.some((h) => !h.name || !h.number)) return fail("Each hotline needs a name and a number.");
  const v = p.data;
  const code = session.barangay.code;
  await db.$transaction(async (tx) => {
    await tx.barangay.update({
      where: { code },
      data: {
        address: v.address,
        landline: v.landline ?? null,
        mobile: v.mobile ?? null,
        email: v.email ?? null,
        facebook: v.facebook ?? null,
        officeHours: hours,
        hotlines: hotlines.map((h) => ({ name: h.name, number: h.number, ...(h.note ? { note: h.note } : {}) })),
      },
    });
    await audit(session, { action: "UPDATE", entityType: "Barangay", entityId: code, summary: "Updated barangay contact details and hotlines" }, tx);
  });
  refreshDashboard();
  return ok("Contact details saved.");
}

// ───────── Officials ─────────

const officialSchema = z
  .object({
    name: req("Name", 120),
    position: req("Position", 80),
    committee: opt(120),
    termStart: optDate,
    termEnd: optDate,
    contact: phone,
    email,
    isSignatory: bool,
    isActive: bool,
  })
  .refine((v) => !v.termStart || !v.termEnd || v.termEnd > v.termStart, { path: ["termEnd"], message: "The term must end after it starts." });

export async function saveOfficial(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const p = parse(officialSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const data = {
    name: v.name,
    position: v.position,
    committee: v.committee ?? null,
    termStart: v.termStart ?? null,
    termEnd: v.termEnd ?? null,
    contact: v.contact ?? null,
    email: v.email ?? null,
    isSignatory: v.isSignatory,
    isActive: id ? v.isActive : true,
  };
  await db.$transaction(async (tx) => {
    // Only one official signs certificates.
    if (v.isSignatory) await tx.barangayOfficial.updateMany({ where: { barangayCode: code, isSignatory: true, NOT: id ? { id } : undefined }, data: { isSignatory: false } });
    if (id) {
      const before = await tx.barangayOfficial.findFirst({ where: { id, barangayCode: code } });
      if (!before) throw new Error("not found");
      await tx.barangayOfficial.update({ where: { id }, data });
      await audit(session, { action: "UPDATE", entityType: "BarangayOfficial", entityId: id, summary: `Updated official ${v.name} (${v.position})`, changes: diff(before as unknown as Record<string, unknown>, data) }, tx);
    } else {
      const count = await tx.barangayOfficial.count({ where: { barangayCode: code } });
      const o = await tx.barangayOfficial.create({ data: { ...data, barangayCode: code, sortOrder: count } });
      await audit(session, { action: "CREATE", entityType: "BarangayOfficial", entityId: o.id, summary: `Added official ${v.name} (${v.position})` }, tx);
    }
  });
  refreshDashboard();
  return ok(id ? "Official updated." : "Official added.");
}

export async function deleteOfficial(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const o = await db.barangayOfficial.findFirst({ where: { id, barangayCode: session.barangay.code } });
  if (!o) return fail("This official was already removed.");
  await db.$transaction(async (tx) => {
    await tx.barangayOfficial.delete({ where: { id } });
    await audit(session, { action: "DELETE", entityType: "BarangayOfficial", entityId: id, summary: `Removed official ${o.name} (${o.position})` }, tx);
  });
  refreshDashboard();
  return ok("Official removed.");
}

// ───────── Councils and bodies ─────────

const bodySchema = z.object({
  acronym: req("Short name", 30),
  name: req("Full name", 160),
  head: opt(120),
  memberCount: int("Members", 0, 10_000),
  isActive: bool,
  description: opt(1000),
});

export async function saveBody(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const p = parse(bodySchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const data = { ...v, head: v.head ?? null, description: v.description ?? null };
  try {
    await db.$transaction(async (tx) => {
      if (id) {
        const before = await tx.barangayBody.findFirst({ where: { id, barangayCode: code } });
        if (!before) throw new Error("not found");
        await tx.barangayBody.update({ where: { id }, data });
        await audit(session, { action: "UPDATE", entityType: "BarangayBody", entityId: id, summary: `Updated ${v.acronym}`, changes: diff(before as unknown as Record<string, unknown>, data) }, tx);
      } else {
        const b = await tx.barangayBody.create({ data: { ...data, barangayCode: code } });
        await audit(session, { action: "CREATE", entityType: "BarangayBody", entityId: b.id, summary: `Added ${v.acronym}` }, tx);
      }
    });
  } catch (e) {
    if (isUnique(e)) return fail(`${v.acronym} already exists.`, { acronym: "This short name is already used." });
    throw e;
  }
  refreshDashboard();
  return ok(id ? "Saved." : "Added.");
}

export async function deleteBody(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const b = await db.barangayBody.findFirst({ where: { id, barangayCode: session.barangay.code } });
  if (!b) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.barangayBody.delete({ where: { id } });
    await audit(session, { action: "DELETE", entityType: "BarangayBody", entityId: id, summary: `Removed ${b.acronym}` }, tx);
  });
  refreshDashboard();
  return ok("Removed.");
}

// ───────── Puroks ─────────

export async function savePurok(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const p = parse(z.object({ name: req("Purok name", 60) }), fd);
  if (!p.ok) return p.state;
  const code = session.barangay.code;
  try {
    await db.$transaction(async (tx) => {
      if (id) {
        const before = await tx.purok.findFirst({ where: { id, barangayCode: code } });
        if (!before) throw new Error("not found");
        await tx.purok.update({ where: { id }, data: { name: p.data.name } });
        await audit(session, { action: "UPDATE", entityType: "Purok", entityId: id, summary: `Renamed ${before.name} to ${p.data.name}` }, tx);
      } else {
        const count = await tx.purok.count({ where: { barangayCode: code } });
        const x = await tx.purok.create({ data: { barangayCode: code, name: p.data.name, sortOrder: count + 1 } });
        await audit(session, { action: "CREATE", entityType: "Purok", entityId: x.id, summary: `Added ${p.data.name}` }, tx);
      }
    });
  } catch (e) {
    if (isUnique(e)) return fail("A purok with this name already exists.", { name: "Already exists." });
    throw e;
  }
  refreshDashboard();
  return ok("Purok saved.");
}

export async function deletePurok(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("profile:edit");
  const id = String(fd.get("id") ?? "");
  const x = await db.purok.findFirst({ where: { id, barangayCode: session.barangay.code }, include: { _count: { select: { residents: true, households: true } } } });
  if (!x) return fail("Already removed.");
  if (x._count.residents || x._count.households) return fail(`${x.name} still has residents or households. Move them first.`);
  await db.$transaction(async (tx) => {
    await tx.purok.delete({ where: { id } });
    await audit(session, { action: "DELETE", entityType: "Purok", entityId: id, summary: `Removed ${x.name}` }, tx);
  });
  refreshDashboard();
  return ok("Purok removed.");
}
