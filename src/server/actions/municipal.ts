"use server";
import { z } from "zod";
import { Frequency, Priority, PublishStatus, ReportKind } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth/staff";
import { formatDate } from "@/lib/dashboard/format";
import { REPORT_KIND, label } from "@/lib/labels";
import { audit, diff } from "@/server/audit";
import { db } from "@/server/db";
import { bool, date, dateTime, enumOf, fail, ok, opt, optDate, parse, req } from "@/server/forms";
import { notifyUsers } from "@/server/notify";
import { refreshDashboard } from "./shared";

const personnel = () => requireRole("MUNICIPAL_PERSONNEL");
const SECRETARY_SUBMISSION = (id: string) => `/dashboard/municipal-submissions/submission-history/${id}`;

// ───────── Reviewing submissions ─────────

/** Start review, approve, or return with remarks. Only the reviewing office (or staff without an office) may decide. */
export async function reviewSubmission(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await personnel();
  const id = String(fd.get("id") ?? "");
  const decision = String(fd.get("decision") ?? "");
  const remarks = String(fd.get("remarks") ?? "").trim().slice(0, 2000);
  const s = await db.submission.findFirst({ where: { id, barangay: { municipalityCode: u.municipality!.code } }, include: { barangay: true, office: true } });
  if (!s) return fail("This submission no longer exists.");
  if (u.office && u.office.id !== s.officeId) return fail(`Only the ${s.office.name} can review this submission.`);

  const moves: Record<string, { from: string[]; to: "UNDER_REVIEW" | "APPROVED" | "RETURNED"; verb: string }> = {
    start: { from: ["SUBMITTED"], to: "UNDER_REVIEW", verb: "Started reviewing" },
    approve: { from: ["SUBMITTED", "UNDER_REVIEW"], to: "APPROVED", verb: "Approved" },
    return: { from: ["SUBMITTED", "UNDER_REVIEW"], to: "RETURNED", verb: "Returned" },
  };
  const m = moves[decision];
  if (!m) return fail("Unknown decision.");
  if (!m.from.includes(s.status)) return fail("This submission was already decided. Refresh the page.");
  if (m.to === "RETURNED" && remarks.length < 10) return fail("Tell the barangay what to fix (at least a sentence).", { remarks: "Explain what to revise." });

  await db.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id },
      data: { status: m.to, reviewedAt: new Date(), reviewedById: u.id, ...(remarks || m.to !== "UNDER_REVIEW" ? { remarks: remarks || (m.to === "APPROVED" ? "Accepted." : null) } : {}) },
    });
    await audit(u.actor, { action: "REVIEW", entityType: "Submission", entityId: id, summary: `${m.verb} "${s.title}" from Barangay ${s.barangay.name}${remarks ? `: ${remarks}` : ""}` }, tx);
    if (m.to !== "UNDER_REVIEW")
      await notifyUsers(
        tx,
        { role: "BARANGAY_SECRETARY", barangayCode: s.barangayCode },
        {
          title: m.to === "APPROVED" ? "Report approved" : "Report returned for revision",
          body: m.to === "APPROVED" ? `${s.office.name} approved ${s.title}.` : `${s.title}: ${remarks}`,
          href: SECRETARY_SUBMISSION(id),
        },
        "submissions",
      );
  });
  refreshDashboard();
  return ok(m.to === "APPROVED" ? "Approved. The barangay was notified." : m.to === "RETURNED" ? "Returned. The barangay was notified." : "Marked as under review.");
}

// ───────── Requirements ─────────

const requirementSchema = z
  .object({
    title: req("Title", 200),
    kind: enumOf(ReportKind, "Report"),
    officeId: req("Office", 40),
    frequency: enumOf(Frequency, "Frequency"),
    periodStart: date("Period start"),
    periodEnd: date("Period end"),
    dueAt: dateTime("Due date"),
    description: opt(2000),
    isActive: bool,
  })
  .refine((v) => v.periodEnd >= v.periodStart, { path: ["periodEnd"], message: "The period must end after it starts." });

export async function saveRequirement(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await personnel();
  const id = String(fd.get("id") ?? "");
  const p = parse(requirementSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = u.municipality!.code;
  const office = await db.municipalOffice.findFirst({ where: { id: v.officeId, municipalityCode: code, isActive: true } });
  if (!office) return fail("Choose an office of this municipality.", { officeId: "Choose an office." });
  const data = { title: v.title, kind: v.kind, officeId: office.id, frequency: v.frequency, periodStart: v.periodStart, periodEnd: v.periodEnd, dueAt: v.dueAt, description: v.description ?? null, isActive: id ? v.isActive : true };
  await db.$transaction(async (tx) => {
    if (id) {
      const before = await tx.reportRequirement.findFirst({ where: { id, municipalityCode: code } });
      if (!before) throw new Error("not found");
      await tx.reportRequirement.update({ where: { id }, data });
      await audit(u.actor, { action: "UPDATE", entityType: "ReportRequirement", entityId: id, summary: `Updated requirement "${v.title}"`, changes: diff(before as unknown as Record<string, unknown>, data) }, tx);
    } else {
      const r = await tx.reportRequirement.create({ data: { ...data, municipalityCode: code, createdById: u.id } });
      await audit(u.actor, { action: "CREATE", entityType: "ReportRequirement", entityId: r.id, summary: `Required "${v.title}" from all barangays, due ${formatDate(v.dueAt.toISOString())}` }, tx);
      await notifyUsers(
        tx,
        { role: "BARANGAY_SECRETARY", barangay: { municipalityCode: code, isActive: true } },
        { title: "New report required", body: `${office.name}: ${v.title} (${label(REPORT_KIND, v.kind)}), due ${formatDate(v.dueAt.toISOString())}.`, href: `/dashboard/municipal-submissions/submit-reports?requirement=${r.id}` },
        "submissions",
      );
    }
  });
  refreshDashboard();
  return ok(id ? "Requirement updated." : "Requirement published. Every active barangay was notified.");
}

// ───────── Announcements ─────────

const announcementSchema = z.object({
  title: req("Title", 160),
  body: req("Message", 5000),
  priority: enumOf(Priority, "Priority"),
  status: enumOf(PublishStatus, "Status"),
  isAdvisory: bool,
  isPinned: bool,
  expiresAt: optDate,
  officeId: opt(40),
});

export async function saveMunicipalAnnouncement(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await personnel();
  const id = String(fd.get("id") ?? "");
  const p = parse(announcementSchema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = u.municipality!.code;
  const officeId = v.officeId ?? u.office?.id ?? null;
  if (officeId && !(await db.municipalOffice.findFirst({ where: { id: officeId, municipalityCode: code } }))) return fail("Choose an office of this municipality.");
  const data = { title: v.title, body: v.body, priority: v.priority, status: v.status, isAdvisory: v.isAdvisory, isPinned: v.isPinned, expiresAt: v.expiresAt ?? null, officeId };
  await db.$transaction(async (tx) => {
    let publishNow = false;
    let annId = id;
    if (id) {
      const a = await tx.announcement.findFirst({ where: { id, scope: "MUNICIPAL", municipalityCode: code } });
      if (!a) throw new Error("not found");
      publishNow = a.status !== "PUBLISHED" && v.status === "PUBLISHED";
      await tx.announcement.update({ where: { id }, data: { ...data, ...(publishNow ? { publishedAt: new Date() } : {}) } });
      await audit(u.actor, { action: "UPDATE", entityType: "Announcement", entityId: id, summary: `Updated announcement "${v.title}"` }, tx);
    } else {
      const a = await tx.announcement.create({ data: { ...data, scope: "MUNICIPAL", municipalityCode: code, authorId: u.id, publishedAt: new Date() } });
      annId = a.id;
      publishNow = v.status === "PUBLISHED";
      await audit(u.actor, { action: "CREATE", entityType: "Announcement", entityId: a.id, summary: `${publishNow ? "Published" : "Drafted"} announcement "${v.title}"` }, tx);
    }
    if (publishNow)
      await notifyUsers(
        tx,
        { role: "BARANGAY_SECRETARY", barangay: { municipalityCode: code, isActive: true } },
        {
          title: v.isAdvisory ? (v.priority === "URGENT" ? "Urgent advisory" : "New advisory") : "New municipal announcement",
          body: v.title,
          href: `/dashboard/announcements-and-communications/${v.isAdvisory ? "important-advisories" : "municipal-announcements"}#${annId}`,
        },
        v.isAdvisory ? "advisories" : "announcements",
      );
  });
  refreshDashboard();
  return ok(v.status === "PUBLISHED" ? "Published. Barangay secretaries were notified." : "Saved.");
}

export async function deleteMunicipalAnnouncement(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await personnel();
  const id = String(fd.get("id") ?? "");
  const a = await db.announcement.findFirst({ where: { id, scope: "MUNICIPAL", municipalityCode: u.municipality!.code } });
  if (!a) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.announcement.delete({ where: { id } });
    await audit(u.actor, { action: "DELETE", entityType: "Announcement", entityId: id, summary: `Deleted announcement "${a.title}"` }, tx);
  });
  refreshDashboard();
  return ok("Announcement deleted.");
}
