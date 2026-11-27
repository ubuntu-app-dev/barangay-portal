import "server-only";
import { db } from "@/server/db";
import { activeHouseholds, activeResidents, householdStatistics, residentDemographics } from "@/server/queries/stats";
import { monthStart } from "@/server/time";
import { AUDIT_ACTION, PRIORITY, SUBMISSION_STATUS, label } from "@/lib/labels";
import type { AppNotification, DashboardData, Session, Task } from "@/types/dashboard";

const iso = (d: Date) => d.toISOString();

/** Everything on the overview page, for the signed-in secretary's barangay only. */
export async function getDashboardData(session: Session): Promise<DashboardData> {
  const code = session.barangay.code;
  const m0 = monthStart(0);
  const m1 = monthStart(-1);
  const res = activeResidents(code);
  const hh = activeHouseholds(code);
  const vawc = session.permissions.includes("vawc:view") ? {} : { isVawc: false };

  const [
    residents,
    resNew,
    resPrev,
    households,
    hhNew,
    hhPrev,
    docs,
    docsNow,
    docsPrev,
    reqGroups,
    reqNow,
    reqPrev,
    incOpen,
    incNow,
    incPrev,
    captain,
    demographics,
    hhStats,
    logs,
    announcements,
    submissions,
  ] = await Promise.all([
    db.resident.count({ where: res }),
    db.resident.count({ where: { ...res, createdAt: { gte: m0 } } }),
    db.resident.count({ where: { ...res, createdAt: { gte: m1, lt: m0 } } }),
    db.household.count({ where: hh }),
    db.household.count({ where: { ...hh, createdAt: { gte: m0 } } }),
    db.household.count({ where: { ...hh, createdAt: { gte: m1, lt: m0 } } }),
    db.issuedDocument.count({ where: { barangayCode: code, status: "VALID" } }),
    db.issuedDocument.count({ where: { barangayCode: code, status: "VALID", issuedAt: { gte: m0 } } }),
    db.issuedDocument.count({ where: { barangayCode: code, status: "VALID", issuedAt: { gte: m1, lt: m0 } } }),
    db.documentRequest.groupBy({ by: ["status"], where: { barangayCode: code }, _count: true }),
    db.documentRequest.count({ where: { barangayCode: code, requestedAt: { gte: m0 } } }),
    db.documentRequest.count({ where: { barangayCode: code, requestedAt: { gte: m1, lt: m0 } } }),
    db.blotterEntry.count({ where: { barangayCode: code, deletedAt: null, ...vawc, status: { in: ["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] } } }),
    db.blotterEntry.count({ where: { barangayCode: code, deletedAt: null, ...vawc, incidentAt: { gte: m0 } } }),
    db.blotterEntry.count({ where: { barangayCode: code, deletedAt: null, ...vawc, incidentAt: { gte: m1, lt: m0 } } }),
    db.barangayOfficial.findFirst({ where: { barangayCode: code, isActive: true, position: "Punong Barangay" } }),
    residentDemographics(code),
    householdStatistics(code),
    db.auditLog.findMany({
      where: { barangayCode: code, action: { notIn: ["LOGIN", "LOGOUT", "LOGIN_FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.announcement.findMany({
      where: { status: "PUBLISHED", OR: [{ scope: "SYSTEM" }, { scope: "MUNICIPAL", municipalityCode: session.barangay.municipalityCode }] },
      include: { office: true },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 4,
    }),
    db.submission.findMany({ where: { barangayCode: code }, include: { office: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  const count = (s: string) => reqGroups.find((g) => g.status === s)?._count ?? 0;
  const tasks = await getTasks(session);
  const subs = await submissionCounts(session);

  return {
    barangayInfo: {
      captain: captain?.name ?? "Not set",
      secretary: session.user.name,
      totalResidents: residents,
      totalHouseholds: households,
      puroks: demographics.byPurok.length,
    },
    stats: {
      residents: { total: residents, newThisMonth: resNew, previousMonthNew: resPrev },
      households: { total: households, newThisMonth: hhNew, previousMonthNew: hhPrev },
      documents: { total: docs, thisMonth: docsNow, previousMonth: docsPrev },
      requests: { pending: count("PENDING"), processing: count("PROCESSING"), ready: count("READY_FOR_RELEASE"), receivedThisMonth: reqNow, receivedLastMonth: reqPrev },
      incidents: { open: incOpen, thisMonth: incNow, previousMonth: incPrev },
      submissions: subs,
    },
    demographics: {
      sex: demographics.sex,
      ageGroups: demographics.ageGroups,
      households: hhStats.sizes,
      classification: demographics.classification.slice(0, 5),
    },
    activities: logs.map((l) => ({
      id: l.id,
      action: label(AUDIT_ACTION, l.action),
      entity: l.entityType,
      description: l.summary,
      performedBy: l.actorName,
      at: iso(l.createdAt),
    })),
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.body.length > 160 ? `${a.body.slice(0, 157)}…` : a.body,
      office: a.office?.name ?? (a.scope === "SYSTEM" ? "LGU Connect" : "Municipal Government"),
      publishedAt: iso(a.publishedAt),
      priority: label(PRIORITY, a.priority) as "Urgent" | "High" | "Normal",
    })),
    tasks,
    submissions: submissions.map((s) => ({
      id: s.id,
      report: s.title,
      submittedAt: s.submittedAt ? iso(s.submittedAt) : null,
      office: s.office.name,
      status: label(SUBMISSION_STATUS, s.status),
      remarks: s.remarks ?? "",
    })),
  };
}

/** Requirements from the municipality this barangay has not yet satisfied. */
export async function openRequirements(session: Session) {
  const reqs = await db.reportRequirement.findMany({
    where: { municipalityCode: session.barangay.municipalityCode, isActive: true },
    include: { office: true, submissions: { where: { barangayCode: session.barangay.code }, orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { dueAt: "asc" },
  });
  return reqs.filter((r) => {
    const latest = r.submissions[0];
    return !latest || latest.status === "DRAFT" || latest.status === "RETURNED";
  });
}

async function submissionCounts(session: Session) {
  const [open, review, returned] = await Promise.all([
    openRequirements(session),
    db.submission.count({ where: { barangayCode: session.barangay.code, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    db.submission.count({ where: { barangayCode: session.barangay.code, status: "RETURNED" } }),
  ]);
  return { awaitingSubmission: open.length, awaitingReview: review, returned };
}

/** Things the secretary should do next, computed from the records (nothing to maintain by hand). */
export async function getTasks(session: Session): Promise<Task[]> {
  const code = session.barangay.code;
  const now = Date.now();
  const [reqs, pending, kp] = await Promise.all([
    openRequirements(session),
    db.documentRequest.count({ where: { barangayCode: code, status: { in: ["PENDING", "PROCESSING"] } } }),
    db.blotterEntry.findMany({
      where: { barangayCode: code, deletedAt: null, kpStage: { not: null }, status: { in: ["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"] } },
      orderBy: { kpDeadline: "asc" },
      take: 3,
    }),
  ]);
  const tasks: Task[] = reqs.map((r) => {
    const returned = r.submissions[0]?.status === "RETURNED";
    const overdue = r.dueAt.getTime() < now;
    const soon = !overdue && r.dueAt.getTime() - now < 7 * 86400_000;
    return {
      id: r.id,
      title: returned ? `Revise and resubmit: ${r.title}` : `Submit ${r.title}`,
      category: r.office.name,
      due: iso(r.dueAt),
      status: returned ? "Returned for Revision" : overdue ? "Overdue" : soon ? "Due Soon" : "Pending",
      href: `/dashboard/municipal-submissions/submit-reports?requirement=${r.id}`,
    };
  });
  if (pending)
    tasks.push({
      id: "requests",
      title: `Process ${pending} open certificate request${pending === 1 ? "" : "s"}`,
      category: "Document Management",
      due: null,
      status: "Pending",
      href: "/dashboard/document-management/certificate-requests",
    });
  for (const k of kp)
    tasks.push({
      id: k.id,
      title: `${k.kpCaseNo ?? k.blotterNo}: ${k.title}`,
      category: "Katarungang Pambarangay deadline",
      due: k.kpDeadline ? iso(k.kpDeadline) : null,
      status: k.kpDeadline && k.kpDeadline.getTime() < now ? "Overdue" : "In Progress",
      href: `/dashboard/blotter-and-incident-management/blotter-records/${k.id}`,
    });
  const rank: Record<string, number> = { Overdue: 0, "Returned for Revision": 1, "Due Soon": 2, "In Progress": 3, Pending: 4 };
  return tasks.sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9)).slice(0, 7);
}

export async function getNotifications(session: Session): Promise<AppNotification[]> {
  const rows = await db.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 15 });
  return rows.map((n) => ({ id: n.id, title: n.title, body: n.body, at: iso(n.createdAt), read: !!n.readAt, href: n.href ?? "/dashboard/announcements-and-communications/notifications" }));
}

/** Counts shown as badges in the menu, keyed by menu item id. */
export async function getNavBadges(session: Session): Promise<Record<string, number>> {
  const code = session.barangay.code;
  const [requests, open, unread] = await Promise.all([
    db.documentRequest.count({ where: { barangayCode: code, status: "PENDING" } }),
    openRequirements(session),
    db.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);
  return { documents: requests, submissions: open.length, announcements: unread };
}
