import "server-only";
import { db } from "./db";
import { notifyUsers } from "./notify";
import { pushToUsers } from "./push";

/**
 * Report deadline reminders, run once a day by Vercel Cron (/api/cron/report-reminders).
 *
 * Barangay secretaries whose barangay has not submitted a required report get one reminder at each stage:
 *   2–3 days left, due tomorrow, due today, and overdue (the first run after the deadline).
 * Municipal personnel of the requiring office get one notice when the deadline passes, listing the
 * barangays that have not submitted. Each goes to the bell and, if the user allowed it, as a push.
 * ReportReminder records what was sent, so a re-run or a missed day never repeats a reminder.
 */

const DAY = 86_400_000;
const PH_OFFSET = 8 * 3600_000;
/** Deadlines older than this are left alone (no surprise reminders for long-past reports). */
const OVERDUE_WINDOW_DAYS = 14;

type Stage = "D3" | "D1" | "D0" | "OVERDUE";

/** Calendar day number in Philippine time, so "due today" means today in Manila. */
const phDay = (d: Date) => Math.floor((d.getTime() + PH_OFFSET) / DAY);

export function stageFor(dueAt: Date, now: Date): Stage | null {
  const left = phDay(dueAt) - phDay(now);
  if (left < 0) return "OVERDUE";
  if (left === 0) return "D0";
  if (left === 1) return "D1";
  if (left <= 3) return "D3";
  return null;
}

const fmt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });

function secretaryMessage(stage: Stage, title: string, office: string, due: Date, now: Date) {
  const what = `${office}: ${title}`;
  const left = phDay(due) - phDay(now);
  switch (stage) {
    case "D3":
      return { title: `Report due in ${left} days`, body: `${what} is due on ${fmt(due)}.` };
    case "D1":
      return { title: "Report due tomorrow", body: `${what} is due tomorrow, ${fmt(due)}.` };
    case "D0":
      return { title: "Report due today", body: `${what} is due today. Submit it before the end of the day.` };
    case "OVERDUE":
      return { title: "Report overdue", body: `${what} was due on ${fmt(due)}. Submit it as soon as you can.` };
  }
}

const SECRETARY_HREF = "/dashboard/municipal-submissions/pending-submissions";
const MUNICIPAL_HREF = "/municipal/compliance";

/** Claims a reminder; false if it was already sent (by an earlier or concurrent run). */
async function claim(requirementId: string, audience: string, stage: Stage) {
  const { count } = await db.reportReminder.createMany({ data: [{ requirementId, audience, stage }], skipDuplicates: true });
  return count === 1;
}

export async function runReportReminders(now = new Date()) {
  const reqs = await db.reportRequirement.findMany({
    where: {
      isActive: true,
      dueAt: { gte: new Date(now.getTime() - OVERDUE_WINDOW_DAYS * DAY), lt: new Date(now.getTime() + 4 * DAY) },
    },
    include: {
      office: { select: { name: true, acronym: true } },
      submissions: { select: { barangayCode: true, status: true }, orderBy: { createdAt: "desc" } },
    },
  });

  const barangaysOf = new Map<string, { code: string; name: string }[]>();
  const summary = { requirements: reqs.length, secretaryReminders: 0, municipalNotices: 0, pushes: 0 };

  for (const r of reqs) {
    const stage = stageFor(r.dueAt, now);
    if (!stage) continue;

    if (!barangaysOf.has(r.municipalityCode)) {
      barangaysOf.set(
        r.municipalityCode,
        await db.barangay.findMany({ where: { municipalityCode: r.municipalityCode, isActive: true }, select: { code: true, name: true }, orderBy: { name: "asc" } }),
      );
    }
    const barangays = barangaysOf.get(r.municipalityCode)!;
    const latest = new Map<string, string>();
    for (const s of r.submissions) if (!latest.has(s.barangayCode)) latest.set(s.barangayCode, s.status);
    const pending = barangays.filter((b) => !latest.has(b.code) || ["DRAFT", "RETURNED"].includes(latest.get(b.code)!));
    if (pending.length === 0) continue;

    const office = r.office.acronym ?? r.office.name;
    const msg = secretaryMessage(stage, r.title, office, r.dueAt, now);
    for (const b of pending) {
      if (!(await claim(r.id, `brgy:${b.code}`, stage))) continue;
      const ids = await notifyUsers(db, { role: "BARANGAY_SECRETARY", barangayCode: b.code }, { ...msg, href: SECRETARY_HREF }, "deadlines");
      summary.secretaryReminders += ids.length;
      summary.pushes += (await pushToUsers(ids, { ...msg, url: SECRETARY_HREF, tag: `report-${r.id}` })).sent;
    }

    if (stage === "OVERDUE" && (await claim(r.id, `office:${r.officeId}`, stage))) {
      const names = pending.map((b) => b.name);
      const list = names.length > 6 ? `${names.slice(0, 6).join(", ")}, and ${names.length - 6} more` : names.join(", ");
      const notice = {
        title: `Deadline passed: ${r.title}`,
        body: `${pending.length} of ${barangays.length} barangays have not submitted: ${list}.`,
      };
      const ids = await notifyUsers(
        db,
        { role: "MUNICIPAL_PERSONNEL", municipalityCode: r.municipalityCode, officeId: r.officeId },
        { ...notice, href: MUNICIPAL_HREF },
        "deadlines",
      );
      summary.municipalNotices += ids.length;
      summary.pushes += (await pushToUsers(ids, { ...notice, url: MUNICIPAL_HREF, tag: `deadline-${r.id}` })).sent;
    }
  }
  return summary;
}
