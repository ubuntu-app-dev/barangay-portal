"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { ReportKind } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { REPORT_KIND, label } from "@/lib/labels";
import { audit } from "@/server/audit";
import { notifyUsers } from "@/server/notify";
import { db } from "@/server/db";
import { enumOf, fail, opt, parse } from "@/server/forms";
import { buildReport, resolvePeriod } from "@/server/reports";
import { phDayRange } from "@/server/time";
import { authorize, refreshDashboard } from "./shared";

const schema = z.object({
  requirementId: opt(40),
  kind: enumOf(ReportKind, "Report").optional(),
  officeId: opt(40),
  period: opt(20),
  from: opt(10),
  to: opt(10),
  title: opt(200),
  notes: opt(4000),
});

/**
 * Generates the figures now, saves them with the submission, and sends it to the reviewing office.
 * A returned submission is replaced by a new version (the old one stays in the history).
 */
export async function submitReport(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("reports:submit");
  const p = parse(schema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;

  const requirement = v.requirementId
    ? await db.reportRequirement.findFirst({ where: { id: v.requirementId, municipalityCode: session.barangay.municipalityCode, isActive: true }, include: { office: true } })
    : null;
  if (v.requirementId && !requirement) return fail("That requirement is no longer open.");
  const kind = requirement?.kind ?? v.kind;
  if (!kind) return fail("Choose the report to submit.", { kind: "Choose a report." });
  const officeId = requirement?.officeId ?? v.officeId;
  const office = officeId ? await db.municipalOffice.findFirst({ where: { id: officeId, municipalityCode: session.barangay.municipalityCode } }) : null;
  if (!office) return fail("Choose the office that will review it.", { officeId: "Choose an office." });
  if (kind === "OTHER" && !v.notes) return fail("Describe what you are submitting.", { notes: "Required for other reports." });

  const custom = v.period === "custom";
  const period = requirement
    ? { ...phDayRange(requirement.periodStart, requirement.periodEnd), label: `${requirement.periodStart.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "UTC" })} to ${requirement.periodEnd.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "UTC" })}` }
    : resolvePeriod(v.period, custom ? v.from : undefined, custom ? v.to : undefined);
  const report = await buildReport(kind, code, period);

  const existing = requirement ? await db.submission.findFirst({ where: { barangayCode: code, requirementId: requirement.id }, orderBy: { createdAt: "desc" } }) : null;
  if (existing && !["DRAFT", "RETURNED"].includes(existing.status)) return fail("This requirement was already submitted. Check its status instead.");

  const title = requirement?.title ?? v.title ?? `${label(REPORT_KIND, kind)} (${report.period?.label ?? "as of today"})`;
  const now = new Date();
  const saved = await db.$transaction(async (tx) => {
    const s = await tx.submission.create({
      data: {
        barangayCode: code,
        requirementId: requirement?.id ?? null,
        officeId: office.id,
        kind,
        title,
        periodStart: requirement?.periodStart ?? new Date(period.from.getTime() + 8 * 3600_000),
        periodEnd: requirement?.periodEnd ?? new Date(period.to.getTime() + 8 * 3600_000 - 86400_000),
        data: report as unknown as Prisma.InputJsonValue,
        notes: v.notes ?? null,
        status: "SUBMITTED",
        version: (existing?.version ?? 0) + 1,
        submittedAt: now,
        submittedById: session.user.id,
      },
    });
    await audit(session, { action: "SUBMIT", entityType: "Submission", entityId: s.id, summary: `${existing ? "Resubmitted" : "Submitted"} ${title} to ${office.name}${existing ? ` (version ${s.version})` : ""}` }, tx);
    // Tell the reviewing office (the Municipal System reads these).
    await notifyUsers(tx, { role: "MUNICIPAL_PERSONNEL", officeId: office.id }, { title: `${existing ? "Resubmission" : "New submission"} from ${session.barangay.name}`, body: title, href: `/municipal/submissions/${s.id}` }, "submissions");
    return s;
  });
  refreshDashboard();
  redirect(`/dashboard/municipal-submissions/submission-history/${saved.id}?saved=submitted`);
}
