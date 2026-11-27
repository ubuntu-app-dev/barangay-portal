"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BlotterKind, BlotterStatus, HearingOutcome, KpStage, PartyRole, Sex } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { routes } from "@/config/navigation";
import { nameFull } from "@/lib/dashboard/format";
import { BLOTTER_STATUS, KP_STAGE, label } from "@/lib/labels";
import { audit, diff, nextNumber, pad } from "@/server/audit";
import { db } from "@/server/db";
import { bool, dateTime, enumOf, fail, ok, opt, optInt, parse, phone, req } from "@/server/forms";
import { ageOn, phYear } from "@/server/time";
import { authorize, refreshDashboard } from "./shared";

const DAY = 86400_000;
/** Katarungang Pambarangay periods (RA 7160): 15 days before the Punong Barangay, 15 (+15) before the Pangkat. */
const KP_DAYS: Record<string, number> = { MEDIATION: 15, CONCILIATION: 15, ARBITRATION: 10 };
const KP_STATUS: Record<string, "UNDER_MEDIATION" | "UNDER_CONCILIATION" | "UNDER_ARBITRATION"> = {
  MEDIATION: "UNDER_MEDIATION",
  CONCILIATION: "UNDER_CONCILIATION",
  ARBITRATION: "UNDER_ARBITRATION",
};

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

/** A party is either a resident (picked) or a named outsider. */
async function partyData(tx: Tx, code: string, fd: FormData, prefix: string) {
  const residentId = String(fd.get(`${prefix}ResidentId`) ?? "").trim();
  if (residentId) {
    const r = await tx.resident.findFirst({ where: { id: residentId, barangayCode: code, deletedAt: null }, include: { purok: true } });
    if (!r) return null;
    return { residentId: r.id, name: nameFull(r), address: `${r.address}${r.purok ? `, ${r.purok.name}` : ""}`, contact: r.contactNumber, age: ageOn(r.birthDate, new Date()), sex: r.sex };
  }
  const name = String(fd.get(`${prefix}Name`) ?? "").trim();
  if (!name) return null;
  const age = Number(fd.get(`${prefix}Age`) ?? "");
  const sex = String(fd.get(`${prefix}Sex`) ?? "");
  return {
    residentId: null,
    name: name.slice(0, 120),
    address: String(fd.get(`${prefix}Address`) ?? "").trim().slice(0, 200) || null,
    contact: String(fd.get(`${prefix}Contact`) ?? "").trim().slice(0, 30) || null,
    age: Number.isInteger(age) && age > 0 && age < 130 ? age : null,
    sex: sex === "MALE" || sex === "FEMALE" ? sex : null,
  } as const;
}

const entrySchema = z.object({
  kind: enumOf(BlotterKind, "Type"),
  category: req("Category", 60),
  title: req("Title", 160),
  narrative: req("What happened", 8000),
  incidentAt: dateTime("Date and time"),
  location: req("Location", 200),
  purokId: opt(40),
  actionTaken: opt(2000),
  isVawc: bool,
});

export async function createBlotterEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const p = parse(entrySchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  if (v.incidentAt.getTime() > Date.now() + 5 * 60_000) return fail("The date and time cannot be in the future.", { incidentAt: "Cannot be in the future." });
  if (v.isVawc && !session.permissions.includes("vawc:view")) return fail("Only the VAW desk officer can record VAWC cases. Refer the complainant to them.");
  const code = session.barangay.code;
  if (v.purokId && !(await db.purok.findFirst({ where: { id: v.purokId, barangayCode: code } }))) return fail("Choose a purok from the list.", { purokId: "Choose a purok." });

  let created: { id: string } | null = null;
  try {
    created = await db.$transaction(async (tx) => {
      const complainant = await partyData(tx, code, fd, "complainant");
      if (!complainant) throw new Error("NO_COMPLAINANT");
      const respondent = await partyData(tx, code, fd, "respondent");
      if (v.kind === "COMPLAINT" && !respondent) throw new Error("NO_RESPONDENT");
      const year = phYear();
      const n = await nextNumber(tx, code, `blotter:${year}`);
      const e = await tx.blotterEntry.create({
        data: {
          barangayCode: code,
          blotterNo: `BL-${year}-${pad(n)}`,
          kind: v.kind,
          category: v.category,
          title: v.title,
          narrative: v.narrative,
          incidentAt: v.incidentAt,
          location: v.location,
          purokId: v.purokId ?? null,
          actionTaken: v.actionTaken ?? null,
          isVawc: v.isVawc,
          recordedById: session.user.id,
          parties: {
            create: [
              { role: v.isVawc ? "VICTIM" : "COMPLAINANT", ...complainant, statement: String(fd.get("complainantStatement") ?? "").trim() || null },
              ...(respondent ? [{ role: "RESPONDENT" as const, ...respondent }] : []),
            ],
          },
        },
      });
      await audit(session, { action: "CREATE", entityType: "BlotterEntry", entityId: e.id, summary: v.isVawc ? `Recorded confidential VAWC entry ${e.blotterNo}` : `Recorded ${v.kind === "COMPLAINT" ? "complaint" : "incident"} ${e.blotterNo}: ${v.title}` }, tx);
      return e;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NO_COMPLAINANT") return fail("Add the complainant: pick a resident or type a name.", { complainantName: "Required." });
    if (e instanceof Error && e.message === "NO_RESPONDENT") return fail("A complaint needs a respondent.", { respondentName: "Required for complaints." });
    throw e;
  }
  refreshDashboard();
  redirect(`${routes.blotter}/${created!.id}?saved=created`);
}

async function findEntry(id: string, code: string, allowVawc: boolean) {
  const e = await db.blotterEntry.findFirst({ where: { id, barangayCode: code, deletedAt: null } });
  if (!e || (e.isVawc && !allowVawc)) return null;
  return e;
}

export async function updateBlotterDetails(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const e = await findEntry(id, session.barangay.code, session.permissions.includes("vawc:view"));
  if (!e) return fail("This entry no longer exists.");
  const p = parse(entrySchema.omit({ kind: true, isVawc: true, purokId: true, actionTaken: true }), fd);
  if (!p.ok) return p.state;
  const changes = diff(e as unknown as Record<string, unknown>, p.data);
  await db.$transaction(async (tx) => {
    await tx.blotterEntry.update({ where: { id }, data: p.data });
    if (Object.keys(changes).length) await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: id, summary: `Corrected details of ${e.blotterNo}`, changes }, tx);
  });
  refreshDashboard();
  return ok("Details updated.");
}

export async function updateBlotterStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const e = await findEntry(id, session.barangay.code, session.permissions.includes("vawc:view"));
  if (!e) return fail("This entry no longer exists.");
  const p = parse(z.object({ status: enumOf(BlotterStatus, "Status"), actionTaken: opt(2000), resolution: opt(2000) }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const closing = ["SETTLED", "CLOSED", "DISMISSED", "CERTIFIED_TO_FILE_ACTION", "REFERRED"].includes(v.status);
  if (closing && !v.resolution) return fail("Describe the outcome before closing.", { resolution: "Describe the outcome." });
  const data = { status: v.status, actionTaken: v.actionTaken ?? e.actionTaken, resolution: v.resolution ?? null, resolvedAt: closing ? (e.resolvedAt ?? new Date()) : null };
  await db.$transaction(async (tx) => {
    await tx.blotterEntry.update({ where: { id }, data });
    await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: id, summary: `${e.blotterNo} is now ${label(BLOTTER_STATUS, v.status)}`, changes: { status: [label(BLOTTER_STATUS, e.status), label(BLOTTER_STATUS, v.status)] } }, tx);
  });
  refreshDashboard();
  return ok(`Status set to ${label(BLOTTER_STATUS, v.status)}.`);
}

/** Starts or advances a Katarungang Pambarangay case and resets its deadline. */
export async function setKpStage(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const e = await findEntry(id, session.barangay.code, false);
  if (!e) return fail("This entry no longer exists (VAWC cases are not settled through the Lupon).");
  const p = parse(z.object({ stage: enumOf(KpStage, "Stage"), extend: bool }), fd);
  if (!p.ok) return p.state;
  const { stage, extend } = p.data;
  const now = new Date();
  const base = extend && e.kpDeadline ? e.kpDeadline : now;
  const deadline = new Date(base.getTime() + KP_DAYS[stage] * DAY);
  await db.$transaction(async (tx) => {
    const caseNo = e.kpCaseNo ?? `KP-${phYear()}-${pad(await nextNumber(tx, session.barangay.code, `kp:${phYear()}`), 3)}`;
    await tx.blotterEntry.update({ where: { id }, data: { kpStage: stage, kpCaseNo: caseNo, kpFiledAt: e.kpFiledAt ?? now, kpDeadline: deadline, status: KP_STATUS[stage] } });
    await audit(
      session,
      { action: "UPDATE", entityType: "BlotterEntry", entityId: id, summary: extend ? `Extended ${label(KP_STAGE, stage).toLowerCase()} period of ${caseNo}` : `${e.kpStage ? "Moved" : "Filed"} ${caseNo} to ${label(KP_STAGE, stage).toLowerCase()}` },
      tx,
    );
  });
  refreshDashboard();
  return ok(`Deadline set to ${deadline.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })}.`);
}

export async function addHearing(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const e = await findEntry(id, session.barangay.code, session.permissions.includes("vawc:view"));
  if (!e) return fail("This entry no longer exists.");
  const p = parse(z.object({ stage: enumOf(KpStage, "Stage"), scheduledAt: dateTime("Schedule"), notes: opt(1000) }), fd);
  if (!p.ok) return p.state;
  await db.$transaction(async (tx) => {
    await tx.caseHearing.create({ data: { entryId: id, stage: p.data.stage, scheduledAt: p.data.scheduledAt, notes: p.data.notes ?? null } });
    await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: id, summary: `Scheduled a ${label(KP_STAGE, p.data.stage).toLowerCase()} hearing for ${e.kpCaseNo ?? e.blotterNo}` }, tx);
  });
  refreshDashboard();
  return ok("Hearing scheduled.");
}

export async function updateHearing(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const p = parse(z.object({ hearingId: req("Hearing", 40), outcome: enumOf(HearingOutcome, "Outcome"), notes: opt(1000) }), fd);
  if (!p.ok) return p.state;
  const h = await db.caseHearing.findFirst({ where: { id: p.data.hearingId, entry: { barangayCode: session.barangay.code, deletedAt: null } }, include: { entry: true } });
  if (!h || (h.entry.isVawc && !session.permissions.includes("vawc:view"))) return fail("This hearing no longer exists.");
  await db.$transaction(async (tx) => {
    await tx.caseHearing.update({ where: { id: h.id }, data: { outcome: p.data.outcome, notes: p.data.notes ?? h.notes } });
    await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: h.entryId, summary: `Recorded hearing outcome for ${h.entry.kpCaseNo ?? h.entry.blotterNo}` }, tx);
  });
  refreshDashboard();
  return ok("Hearing updated.");
}

export async function addParty(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const e = await findEntry(id, session.barangay.code, session.permissions.includes("vawc:view"));
  if (!e) return fail("This entry no longer exists.");
  const p = parse(z.object({ role: enumOf(PartyRole, "Role"), statement: opt(4000), partyAge: optInt(0, 130), partySex: enumOf(Sex, "Sex").optional(), partyContact: phone }), fd);
  if (!p.ok) return p.state;
  const done = await db.$transaction(async (tx) => {
    const party = await partyData(tx, session.barangay.code, fd, "party");
    if (!party) return false;
    await tx.blotterParty.create({ data: { ...party, entryId: id, role: p.data.role, statement: p.data.statement ?? null } });
    await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: id, summary: `Added ${party.name} to ${e.blotterNo}` }, tx);
    return true;
  });
  if (!done) return fail("Pick a resident or type the person's name.", { partyName: "Required." });
  refreshDashboard();
  return ok("Person added.");
}

export async function removeParty(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const partyId = String(fd.get("partyId") ?? "");
  const party = await db.blotterParty.findFirst({ where: { id: partyId, entry: { barangayCode: session.barangay.code } }, include: { entry: true } });
  if (!party || (party.entry.isVawc && !session.permissions.includes("vawc:view"))) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.blotterParty.delete({ where: { id: partyId } });
    await audit(session, { action: "UPDATE", entityType: "BlotterEntry", entityId: party.entryId, summary: `Removed ${party.name} from ${party.entry.blotterNo}` }, tx);
  });
  refreshDashboard();
  return ok("Person removed.");
}

export async function archiveBlotterEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("incidents:record");
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("reason") ?? "").trim();
  if (reason.length < 5) return fail("Give the reason.", { reason: "Give a reason." });
  const e = await findEntry(id, session.barangay.code, session.permissions.includes("vawc:view"));
  if (!e) return fail("This entry no longer exists.");
  await db.$transaction(async (tx) => {
    await tx.blotterEntry.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit(session, { action: "DELETE", entityType: "BlotterEntry", entityId: id, summary: `Archived ${e.blotterNo} (entered by mistake): ${reason}` }, tx);
  });
  refreshDashboard();
  redirect(`${e.isVawc ? routes.vawc : routes.blotter}?saved=archived`);
}
