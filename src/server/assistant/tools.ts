import "server-only";
import { z } from "zod/v4";
import type { WorkspaceKey } from "@/config/workspaces";
import type { StaffSession } from "@/lib/auth/staff";
import { KP_STAGE, REQUEST_STATUS, SUBMISSION_STATUS, label } from "@/lib/labels";
import { db } from "@/server/db";
import { adminOverview } from "@/server/queries/admin";
import { activeBarangays, municipalOverview, requirementProgress } from "@/server/queries/municipal";
import { ROLE_LABEL } from "@/server/queries/users";
import { buildConsolidated, buildReport, PERIODS, resolvePeriod } from "@/server/reports";
import type { ReportData } from "@/types/reports";
import { searchKnowledge } from "./knowledge";

/**
 * The assistant's tools. Every tool is built for ONE signed-in user and reads only within that
 * user's scope (their barangay, their municipality, or the whole system for the superadmin).
 *
 * Privacy rule (RA 10173): tools return only totals, statuses, titles of reports, and names of
 * barangays and offices. They never return a resident's name, address, or any individual record,
 * and VAWC cases are never counted (buildReport already excludes them).
 */

const DAY = 86400_000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });
const json = (v: unknown) => JSON.stringify(v);
const cleanName = (s: string) => s.trim().toLowerCase().replace(/^(barangay|brgy\.?)\s+/, "");

/** A report reduced to figures: drops any row that carries text (officials' names) and the officials section. */
function figures(r: ReportData) {
  return {
    title: r.title,
    scope: r.barangay,
    period: r.period?.label ?? "As of today",
    highlights: r.highlights,
    sections: r.sections
      .filter((s) => !/official/i.test(s.title) && !s.rows.some((x) => x.text))
      .map((s) => ({ title: s.title, rows: s.rows.map(({ label, value }) => ({ label, value })) })),
    note: r.note,
  };
}

/** A tool in a provider-neutral shape; claude.ts and gemini.ts adapt it to each API. */
export type AssistantTool<S extends z.ZodObject = z.ZodObject> = {
  name: string;
  description: string;
  schema: S;
  run: (input: z.infer<S>) => Promise<string>;
};
const tool = <S extends z.ZodObject>(t: { name: string; description: string; inputSchema: S; run: (input: z.infer<S>) => Promise<string> }): AssistantTool => ({
  name: t.name,
  description: t.description,
  schema: t.inputSchema,
  run: t.run as AssistantTool["run"],
});

const REPORTS = ["DEMOGRAPHICS", "HOUSEHOLDS", "CERTIFICATES", "BLOTTER", "COMMUNITY_RESOURCES"] as const;
const PERIOD_KEYS = Object.keys(PERIODS) as [keyof typeof PERIODS, ...(keyof typeof PERIODS)[]];

export function assistantTools(u: StaffSession, ws: WorkspaceKey): AssistantTool[] {
  const searchHelp = tool({
    name: "search_help",
    description:
      "Search LGU Connect's help guides, FAQs, and page descriptions for how to do something or where to find something. " +
      "Use it before answering any how-to, navigation, or policy question. Returns matching entries with a link to the page.",
    inputSchema: z.object({
      query: z.string().min(2).max(200).describe("What the user wants to do or find, in a few words, e.g. 'issue barangay clearance' or 'reset a password'."),
    }),
    run: async ({ query }) => {
      const hits = searchKnowledge(query, ws);
      if (hits.length === 0) return "No matching help entries. Answer from the page directory if it covers the question, otherwise say you are not sure.";
      return json(hits.map((d) => ({ title: d.title, link: d.href ?? null, text: d.body })));
    },
  });

  const getStatistics = tool({
    name: "get_statistics",
    description:
      "Get aggregate figures (counts only, never names) from the records the user is allowed to see. " +
      "DEMOGRAPHICS: residents by sex, age group, sector (seniors, PWD, solo parents, 4Ps, voters, IP, OFW, out-of-school youth), civil status, education, purok. " +
      "HOUSEHOLDS: households by water source, toilet, electricity, tenure, average size. " +
      "CERTIFICATES: documents issued in a period by type, fees, requests by status. " +
      "BLOTTER: incidents and complaints in a period by kind, category, status (VAWC excluded). " +
      "COMMUNITY_RESOURCES: resources by category and condition, animals and vaccination. " +
      (ws === "secretary"
        ? "Figures are for the user's own barangay."
        : ws === "superadmin"
          ? "Name a municipality (and optionally a barangay in it); without one, figures cover every active barangay in the system."
          : "Without a barangay, figures are added up across all active barangays of the user's municipality; name a barangay for its own figures."),
    inputSchema: z.object({
      report: z.enum(REPORTS),
      period: z.enum(PERIOD_KEYS).optional().describe("For CERTIFICATES and BLOTTER. Default this-month."),
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Custom start date YYYY-MM-DD (with `to`)."),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Custom end date YYYY-MM-DD, inclusive."),
      barangay: z.string().max(80).optional().describe("Barangay name, for municipal staff and the superadmin."),
      municipality: z.string().max(80).optional().describe("Municipality name, superadmin only."),
    }),
    run: async ({ report, period, from, to, barangay, municipality }) => {
      const p = resolvePeriod(period, from, to);

      if (ws === "secretary") {
        if (!u.barangay) return "No barangay is assigned to this account.";
        if (barangay && cleanName(barangay) !== cleanName(u.barangay.name))
          return `You can only see figures for Barangay ${u.barangay.name}.`;
        return json(figures(await buildReport(report, u.barangay.code, p)));
      }

      let munCode = u.municipality?.code;
      let munName = u.municipality?.name;
      if (ws === "superadmin" && municipality) {
        const m = await db.municipality.findFirst({ where: { name: { equals: municipality.trim(), mode: "insensitive" } }, select: { code: true, name: true } });
        if (!m) return `No municipality named "${municipality}" is on LGU Connect.`;
        munCode = m.code;
        munName = m.name;
      }
      const list = await db.barangay.findMany({
        where: { isActive: true, ...(munCode && (ws !== "superadmin" || municipality) ? { municipalityCode: munCode } : {}) },
        select: { code: true, name: true },
        orderBy: { name: "asc" },
        take: 400,
      });
      if (list.length === 0) return "There are no active barangays in this scope yet.";

      if (barangay) {
        const b = list.find((x) => cleanName(x.name) === cleanName(barangay));
        if (!b) return `No active barangay named "${barangay}" in ${munName ?? "this scope"}. Active barangays: ${list.map((x) => x.name).join(", ")}.`;
        return json(figures(await buildReport(report, b.code, p)));
      }
      const title = munName && (ws !== "superadmin" || municipality) ? `Municipality of ${munName}` : "All active barangays";
      const { report: r, byBarangay } = await buildConsolidated(report, list, p, title);
      return json({ ...figures(r), byBarangay: byBarangay.map((b) => ({ barangay: b.name, figures: b.values })) });
    },
  });

  const getWorkStatus = tool({
    name: "get_work_status",
    description:
      "Get what needs attention now for this user: pending document requests, open and KP cases near their deadline, reports due to the municipality, unread notifications (secretary); " +
      "submissions to review, requirement progress, and which barangays have not submitted each report (municipal staff); account and onboarding health (IT administrator); system health (superadmin). Counts, titles, and barangay names only.",
    inputSchema: z.object({}),
    run: async () => {
      const unread = await db.notification.count({ where: { userId: u.id, readAt: null } });

      if (ws === "secretary" && u.barangay) {
        const code = u.barangay.code;
        const now = new Date();
        const [requests, openCases, kp, reqs] = await Promise.all([
          db.documentRequest.groupBy({ by: ["status"], where: { barangayCode: code, status: { in: ["PENDING", "PROCESSING", "READY_FOR_RELEASE"] } }, _count: true }),
          db.blotterEntry.count({ where: { barangayCode: code, deletedAt: null, isVawc: false, status: { in: ["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] } } }),
          db.blotterEntry.findMany({
            where: { barangayCode: code, deletedAt: null, isVawc: false, kpStage: { not: null }, kpDeadline: { not: null }, status: { in: ["UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] } },
            select: { kpStage: true, kpDeadline: true },
          }),
          db.reportRequirement.findMany({
            where: { municipalityCode: u.barangay.municipalityCode, isActive: true },
            include: { office: true, submissions: { where: { barangayCode: code }, orderBy: { createdAt: "desc" }, take: 1 } },
            orderBy: { dueAt: "asc" },
          }),
        ]);
        const due = reqs
          .map((r) => {
            const latest = r.submissions[0];
            const done = latest && !["DRAFT", "RETURNED"].includes(latest.status);
            return {
              report: r.title,
              office: r.office.acronym ?? r.office.name,
              due: fmtDate(r.dueAt),
              status: done ? label(SUBMISSION_STATUS, latest!.status) : latest?.status === "RETURNED" ? "Returned for revision" : r.dueAt < now ? "Overdue" : "Not submitted",
            };
          })
          .filter((r) => !["Approved"].includes(r.status));
        return json({
          barangay: u.barangay.name,
          documentRequests: Object.fromEntries(requests.map((r) => [label(REQUEST_STATUS, r.status), r._count])),
          openBlotterCases: openCases,
          kpCases: {
            active: kp.length,
            overdue: kp.filter((k) => k.kpDeadline! < now).length,
            dueWithin3Days: kp.filter((k) => k.kpDeadline! >= now && k.kpDeadline!.getTime() - now.getTime() <= 3 * DAY).length,
            byStage: Object.fromEntries(Object.keys(KP_STAGE).map((s) => [label(KP_STAGE, s), kp.filter((k) => k.kpStage === s).length])),
          },
          reportsToMunicipality: due,
          unreadNotifications: unread,
        });
      }

      if (ws === "municipal") {
        const [o, reqs, active] = await Promise.all([municipalOverview(u), requirementProgress(u), activeBarangays(u)]);
        /** Active barangays whose latest submission for a requirement is missing, a draft, or returned. */
        const notYet = (r: (typeof reqs)[number]) => {
          const latest = new Map<string, string>();
          for (const s of r.submissions) if (!latest.has(s.barangayCode)) latest.set(s.barangayCode, s.status);
          return active.filter((b) => !latest.has(b.code) || ["DRAFT", "RETURNED"].includes(latest.get(b.code)!)).map((b) => b.name);
        };
        return json({
          municipality: u.municipality?.name,
          office: u.office?.name ?? "All offices",
          barangays: { active: o.active, total: o.total },
          submissionsWaitingForReview: o.inbox,
          requirements: reqs.map((r) => ({
            report: r.title,
            office: r.office.acronym ?? r.office.name,
            due: fmtDate(r.dueAt),
            submitted: `${r.done} of ${r.expected}`,
            approved: r.approved,
            overdue: r.dueAt < new Date() && r.done < r.expected,
            notYetSubmittedBy: notYet(r),
          })),
          totals: { residents: o.population, households: o.households, documentsThisMonth: o.docsMonth, openCases: o.openCases },
          unreadNotifications: unread,
        });
      }

      if (ws === "admin") {
        const o = await adminOverview(u);
        return json({
          municipality: u.municipality?.name,
          accounts: { active: o.active, suspendedOrDeactivated: o.blocked, lockedNow: o.locked, stillOnTemporaryPassword: o.temp },
          failedSignInsLast7Days: o.failed,
          barangays: { onboarded: o.barangaysActive, total: o.barangaysTotal },
          onboardedBarangaysWithoutSecretary: o.noAccount.map((b) => b.name),
          unreadNotifications: unread,
        });
      }

      // superadmin
      const since = new Date(Date.now() - 7 * DAY);
      const [muns, brgys, byRole, locked, failed] = await Promise.all([
        db.municipality.groupBy({ by: ["isActive"], _count: true }),
        db.barangay.count({ where: { isActive: true } }),
        db.user.groupBy({ by: ["role", "status"], _count: true }),
        db.user.count({ where: { lockedUntil: { gt: new Date() } } }),
        db.auditLog.count({ where: { action: "LOGIN_FAILED", createdAt: { gte: since } } }),
      ]);
      return json({
        municipalities: { active: muns.find((m) => m.isActive)?._count ?? 0, inactive: muns.find((m) => !m.isActive)?._count ?? 0 },
        onboardedBarangays: brgys,
        accounts: byRole.map((r) => ({ role: ROLE_LABEL[r.role], status: r.status.toLowerCase(), count: r._count })),
        lockedAccountsNow: locked,
        failedSignInsLast7Days: failed,
        unreadNotifications: unread,
      });
    },
  });

  return [searchHelp, getStatistics, getWorkStatus];
}
