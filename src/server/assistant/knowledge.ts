import "server-only";
import { WORKSPACES, flattenWs, type WorkspaceKey } from "@/config/workspaces";
import { SECRETARY_FAQ, SECRETARY_GUIDES } from "@/data/help-content";

/**
 * What the assistant knows about using LGU Connect: one entry per page, task guide, and FAQ.
 * `search_help` retrieves from here before the assistant answers a how-to question.
 * Add or edit entries here; the assistant picks them up on the next request.
 */
export type KnowledgeDoc = {
  id: string;
  title: string;
  /** Workspaces this applies to. */
  roles: WorkspaceKey[];
  href?: string;
  body: string;
};

/** What each page is for, keyed by path. Pages without an entry still appear with their title. */
const PAGE_NOTES: Record<string, string> = {
  "/dashboard": "Overview of the barangay: live counts with month-on-month trends, tasks with deadlines, demographics, announcements, and recent activity.",
  "/dashboard/help": "Step-by-step guides, frequently asked questions, and the contact details of the municipal IT administrator.",
  "/dashboard/barangay-profile/barangay-information": "Barangay history, land area, boundaries (north, south, east, west), classification, and puroks. Edit with the Edit button.",
  "/dashboard/barangay-profile/barangay-officials": "Punong Barangay, kagawads, SK chair, secretary and treasurer, with terms and committees. The official marked as signatory appears on certificates.",
  "/dashboard/barangay-profile/organizational-information": "Org chart and barangay councils and committees (BDRRMC, BCPC, BADAC, Lupon and others) with their members.",
  "/dashboard/barangay-profile/barangay-contact-details": "Hall address, phone numbers, email, office hours, and emergency hotlines.",
  "/dashboard/resident-management/resident-records": "Search and filter all residents (by purok, sex, age, sector, voter status). Open a record to edit, archive, or see its change history. Export to CSV.",
  "/dashboard/resident-management/add-new-resident": "Form to register a new resident: name, birth date, sex, civil status, address, household and relationship, and classifications (voter, PWD, solo parent, 4Ps, IP, OFW, out-of-school youth).",
  "/dashboard/resident-management/household-records": "Households with their members, families, water source, toilet type, electricity, and tenure. Add a household with Add household.",
  "/dashboard/resident-management/family-composition": "Families within households and their members.",
  "/dashboard/resident-management/resident-classification": "Sector lists: senior citizens (computed from birth date), PWD, solo parents, 4Ps, voters, indigenous people, OFWs, out-of-school youth.",
  "/dashboard/document-management/certificate-requests": "Requests from residents: pending, processing, ready for release, released, rejected. Move a request through each stage or issue it.",
  "/dashboard/document-management/certificate-issuance": "Issue a certificate: choose the document type and resident, type the purpose, enter the O.R. number when there is a fee, check the live preview, then Issue and print.",
  "/dashboard/document-management/barangay-clearance": "Barangay clearances issued, plus the fee, requirements, and wording for this document.",
  "/dashboard/document-management/certificate-of-indigency": "Certificates of indigency issued, plus the fee, requirements, and wording.",
  "/dashboard/document-management/certificate-of-residency": "Certificates of residency issued, plus the fee, requirements, and wording.",
  "/dashboard/document-management/certificate-of-good-moral-character": "Certificates of good moral character issued, plus the fee, requirements, and wording.",
  "/dashboard/document-management/other-barangay-documents": "Other document types the barangay issues (for example business clearance or first-time jobseeker certificate).",
  "/dashboard/document-management/issuance-history": "Every document issued, with control numbers. Reprint or void a document here (voiding needs a reason).",
  "/dashboard/blotter-and-incident-management/blotter-records": "All blotter entries (incidents and complaints) except VAWC cases. Open an entry to update its status, add parties, or file it as a KP case.",
  "/dashboard/blotter-and-incident-management/new-incident-report": "Record a new incident report or complaint with its parties, place, date, and narrative.",
  "/dashboard/blotter-and-incident-management/complaint-records": "Complaints only (entries with a complainant and a respondent).",
  "/dashboard/blotter-and-incident-management/case-monitoring": "Open cases and their status.",
  "/dashboard/blotter-and-incident-management/katarungang-pambarangay": "KP cases by stage (mediation, conciliation, arbitration) with their 15-day deadlines, extensions, and hearings.",
  "/dashboard/blotter-and-incident-management/vawc-records": "VAWC cases under RA 9262. Confidential: only users given VAWC access by the IT administrator can open this page.",
  "/dashboard/community-resources/animal-records-and-tracking": "Animal registry (dogs, cats, livestock) with owners and rabies vaccination dates; shows animals due for vaccination.",
  "/dashboard/community-resources/water-service-classification": "Household water service level (Level I, II, III, delivered, none) per household and by purok.",
  "/dashboard/community-resources/community-resource-records": "Inventory of barangay equipment and facilities with quantity, condition, and custodian.",
  "/dashboard/reports-and-analytics/resident-demographics": "Population by sex, age group, sector, civil status, education, and purok. Print, export CSV, or submit to the municipality.",
  "/dashboard/reports-and-analytics/household-statistics": "Households by water source, toilet type, electricity, tenure, and average size.",
  "/dashboard/reports-and-analytics/certificate-issuance-reports": "Documents issued in a period, by type, with fees collected.",
  "/dashboard/reports-and-analytics/blotter-and-incident-reports": "Blotter entries in a period by kind, category, status, and outcome (VAWC excluded).",
  "/dashboard/reports-and-analytics/community-resource-reports": "Resources by category and condition, and animal vaccination status.",
  "/dashboard/reports-and-analytics/generate-reports": "Generate any report for a chosen period, then print or export it.",
  "/dashboard/municipal-submissions/pending-submissions": "Reports the municipality requires that your barangay has not submitted yet, with due dates. Click Prepare to generate and submit.",
  "/dashboard/municipal-submissions/submit-reports": "Submit a report to a municipal office; the figures are generated from your records.",
  "/dashboard/municipal-submissions/submission-history": "Everything you have submitted, with versions. Returned reports show the reviewer's remarks and can be resubmitted.",
  "/dashboard/municipal-submissions/submission-status": "Status of each submission: submitted, under review, approved, or returned for revision.",
  "/dashboard/announcements-and-communications/municipal-announcements": "Announcements from the municipality. Mark them as read.",
  "/dashboard/announcements-and-communications/barangay-announcements": "Your barangay's own announcements: draft, publish, pin, and set an expiry date.",
  "/dashboard/announcements-and-communications/notifications": "Your notifications (returned reports, new requirements, advisories). Mark as read or delete.",
  "/dashboard/announcements-and-communications/important-advisories": "Urgent advisories from the municipality (for example weather or health warnings).",
  "/dashboard/activity-history/recent-activities": "Recent actions in the barangay (who did what and when).",
  "/dashboard/activity-history/record-update-history": "Changes to records with the before and after values.",
  "/dashboard/settings/account-profile": "Your name, position, email, and mobile number.",
  "/dashboard/settings/change-password": "Change your password; you can also sign out your other devices.",
  "/dashboard/settings/notification-preferences": "Choose which notifications you receive.",

  "/municipal": "Municipal totals from active barangays, report requirement progress, and the latest submissions.",
  "/municipal/submissions": "Inbox of reports submitted by barangays to your office (or all offices), oldest first. Open one to start review, approve, or return it with remarks.",
  "/municipal/requirements": "Reports the municipality requires from every barangay: create, edit, or deactivate a requirement with its period and due date. Secretaries are notified.",
  "/municipal/compliance": "For each requirement: which barangays have submitted, which are late, and which have not yet.",
  "/municipal/barangays": "Directory of barangays with residents, households, secretary contact, and overdue reports.",
  "/municipal/reports": "Consolidated reports: any report added up across all active barangays, with a per-barangay comparison table. Print it.",
  "/municipal/announcements": "Post announcements or urgent advisories to every barangay (draft, pin, expiry). Shows how many secretaries have read each one.",

  "/admin": "Account health: active, locked, and temporary-password accounts; failed sign-ins; onboarded barangays that have no secretary yet.",
  "/admin/users": "Barangay secretary and municipal personnel accounts: create, edit, reset password, unlock, suspend, reactivate, deactivate, and grant or remove VAWC access.",
  "/admin/barangays": "Onboard (activate) a barangay, which adds its puroks, default document types and fees, and councils. Deactivate a barangay to block its secretaries.",
  "/admin/offices": "Municipal offices (MPDO, MHO, MSWDO and others): add, rename, or deactivate.",
  "/admin/audit": "Audit log of sign-ins, failed attempts, exports, and record changes in the municipality.",

  "/superadmin": "System overview: municipalities, onboarded barangays, residents, sessions, database size, failed sign-ins, and accounts by role.",
  "/superadmin/municipalities": "Onboard a municipality from the official PSGC list (loads all its barangays and default offices), refresh names, or deactivate it.",
  "/superadmin/administrators": "Municipal IT administrator and superadmin accounts: create, reset password, suspend.",
  "/superadmin/system-settings": "Session length, minimum password length, and a notice banner shown on every signed-in page. Changes apply immediately.",
  "/superadmin/audit": "System-wide audit log, filterable by municipality and action.",
};

const SETTINGS_NOTE: Record<string, string> = {
  "account-profile": PAGE_NOTES["/dashboard/settings/account-profile"],
  "change-password": PAGE_NOTES["/dashboard/settings/change-password"],
  "notification-preferences": PAGE_NOTES["/dashboard/settings/notification-preferences"],
};

function noteFor(href: string) {
  if (PAGE_NOTES[href]) return PAGE_NOTES[href];
  const tail = href.split("/").pop() ?? "";
  if (href.includes("/settings/") && SETTINGS_NOTE[tail]) return SETTINGS_NOTE[tail];
  if (href.endsWith("/notifications")) return "Your notifications. Mark as read or delete.";
  return "";
}

/** One line per page of a workspace, for the system prompt. Restricted pages are marked. */
export function pageDirectory(ws: WorkspaceKey, permissions: string[]) {
  return flattenWs(WORKSPACES[ws])
    .filter((e) => (e.parent ? true : !flattenWs(WORKSPACES[ws]).some((c) => c.parent === e.title)))
    .map((e) => {
      const locked = e.requires && !permissions.includes(e.requires) && !permissions.includes("*");
      const title = e.parent ? `${e.parent} > ${e.title}` : e.title;
      const note = noteFor(e.href);
      return `- [${title}](${e.href})${locked ? " (you do not have access)" : ""}${note ? `: ${note}` : ""}`;
    })
    .join("\n");
}

const GUIDES: KnowledgeDoc[] = [
  ...SECRETARY_GUIDES.map((g) => ({
    id: `guide:${g.title}`,
    title: g.title,
    roles: ["secretary"] as WorkspaceKey[],
    href: g.href,
    body: g.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
  })),
  {
    id: "guide:add-household",
    title: "Add a household",
    roles: ["secretary"],
    href: "/dashboard/resident-management/household-records/new",
    body: "1. Open Resident Management > Household Records and click Add household.\n2. Enter the household number, purok, and address.\n3. Set water source, toilet type, electricity, and tenure.\n4. Save, then add members from Add New Resident (choose this household and each member's relationship to the head).",
  },
  {
    id: "guide:void-document",
    title: "Void or reprint an issued document",
    roles: ["secretary"],
    href: "/dashboard/document-management/issuance-history",
    body: "Open Document Management > Issuance History and find the document by control number or name. Click Print to reprint (each print is counted). Click Void, give the reason, and confirm; a voided document can no longer be printed. Issue a new one if a correction is needed.",
  },
  {
    id: "guide:kp-case",
    title: "File and track a Katarungang Pambarangay (KP) case",
    roles: ["secretary"],
    href: "/dashboard/blotter-and-incident-management/katarungang-pambarangay",
    body: "1. Record the complaint in New Incident Report (choose Complaint, add complainant and respondent).\n2. Open the entry and click File as a KP case. Mediation by the Punong Barangay starts with a 15-day deadline.\n3. Schedule hearings and record their outcome.\n4. Move to conciliation before the Pangkat (15 days, which the Pangkat may extend once by up to 15 days) or arbitration if mediation fails.\n5. Record the settlement or issue a certificate to file action.",
  },
  {
    id: "guide:returned-report",
    title: "Fix and resubmit a returned report",
    roles: ["secretary"],
    href: "/dashboard/municipal-submissions/submission-history",
    body: "Open Municipal Submissions > Submission History (or the notification) and read the reviewer's remarks. Correct the records the remarks point to, then click Resubmit. A new version is generated from your updated records and sent back to the same office.",
  },
  {
    id: "guide:announcement",
    title: "Post a barangay announcement",
    roles: ["secretary"],
    href: "/dashboard/announcements-and-communications/barangay-announcements",
    body: "Open Announcements and Communications > Barangay Announcements and click New announcement. Write the title and message, choose to pin it or set an expiry date, then Publish (or save as draft).",
  },
  {
    id: "guide:certificate-fees",
    title: "Change certificate fees, requirements, or wording",
    roles: ["secretary"],
    href: "/dashboard/document-management/barangay-clearance",
    body: "Open the certificate's page under Document Management (for example Barangay Clearance) and click Fee and requirements. Change the fee, the list of requirements, or the wording, then save. Follow the barangay's approved schedule of fees.",
  },
  {
    id: "guide:review-submission",
    title: "Review a barangay's submitted report",
    roles: ["municipal"],
    href: "/municipal/submissions",
    body: "1. Open Submissions. Reports waiting for review are listed oldest first.\n2. Open a report and click Start review (the secretary sees it is under review).\n3. Check the figures. Click Approve, or Return with remarks of at least 10 characters explaining what to correct.\n4. The secretary is notified either way. A resubmitted report appears again as a new version.",
  },
  {
    id: "guide:create-requirement",
    title: "Require a report from all barangays",
    roles: ["municipal"],
    href: "/municipal/requirements",
    body: "Open Requirements and click New requirement. Give a title, choose the report type, the period it covers, and the due date, then Publish. Every active barangay secretary is notified and sees it under Pending Submissions. Track who has submitted in Compliance.",
  },
  {
    id: "guide:consolidated",
    title: "Get municipal totals across barangays",
    roles: ["municipal"],
    href: "/municipal/reports",
    body: "Open Consolidated Reports, choose the report (demographics, households, certificates, blotter, community resources) and the period. Figures are added up across all active barangays, with a table per barangay. Print it from the page.",
  },
  {
    id: "guide:municipal-announcement",
    title: "Send an announcement or urgent advisory to barangays",
    roles: ["municipal"],
    href: "/municipal/announcements",
    body: "Open Announcements and click New announcement. Write the title and message; tick Advisory for urgent notices. Pin it or set an expiry, then Publish. Secretaries are notified and the page shows how many have read it.",
  },
  {
    id: "guide:create-account",
    title: "Create an account for a barangay secretary or municipal staff",
    roles: ["admin"],
    href: "/admin/users/new",
    body: "1. Open User Accounts and click New account.\n2. Choose the role. For a secretary pick the barangay; for municipal personnel pick the office.\n3. Enter the name and username (email and mobile are optional) and click Create account.\n4. A temporary password is shown once: copy it and give it to the person privately. They must change it at first sign-in.\nOnboard the barangay first if it is not active yet.",
  },
  ...(["admin", "superadmin"] as const).flatMap((ws) => {
    const href = ws === "admin" ? "/admin/users" : "/superadmin/administrators";
    const where = ws === "admin" ? "User Accounts" : "Administrators";
    return [
      {
        id: `guide:reset-password:${ws}`,
        title: "Reset a password or unlock an account",
        roles: [ws] as WorkspaceKey[],
        href,
        body: `Open ${where} and open the account. Click Reset password: a new temporary password is shown once and the person must change it at next sign-in. If the account is locked after 5 wrong passwords, click Unlock (it also unlocks by itself after 15 minutes).`,
      },
      {
        id: `guide:suspend-account:${ws}`,
        title: "Suspend, reactivate, or deactivate an account",
        roles: [ws] as WorkspaceKey[],
        href,
        body: `Open ${where} and open the account. Click Suspend (give a reason) to block sign-in temporarily, or Deactivate when the person leaves. Either signs them out on every device. Reactivate restores access.`,
      },
    ];
  }),
  {
    id: "guide:vawc-access",
    title: "Give or remove VAWC access",
    roles: ["admin", "secretary"],
    href: "/admin/users",
    body: "VAWC cases (RA 9262) are confidential. Only the municipal IT administrator can grant access: open the secretary's account in User Accounts and turn on VAWC access. Give it only to the designated VAW desk officer.",
  },
  {
    id: "guide:onboard-barangay",
    title: "Onboard a barangay",
    roles: ["admin"],
    href: "/admin/barangays",
    body: "Open Barangay Onboarding, find the barangay, and click Onboard. Enter the number of puroks and click Activate. Puroks, default document types and fees, and councils are added. Then create the secretary's account in User Accounts.",
  },
  {
    id: "guide:onboard-municipality",
    title: "Onboard a municipality",
    roles: ["superadmin"],
    href: "/superadmin/municipalities/new",
    body: "Open Municipalities and click Onboard a municipality. Pick the region, province, and city or municipality from the official PSGC list and confirm. All its barangays and the default offices are loaded. Then create its IT administrator in Administrators; the IT administrator onboards barangays and creates the other accounts.",
  },
  {
    id: "guide:system-banner",
    title: "Show a maintenance notice or change security settings",
    roles: ["superadmin"],
    href: "/superadmin/system-settings",
    body: "Open System Settings. Type a banner message to show it on every signed-in page (clear it to remove). Set the session length (1 to 72 hours) and the minimum password length (8 to 32). Save; changes apply immediately.",
  },
];

const FAQS: KnowledgeDoc[] = [
  ...SECRETARY_FAQ.map(([q, a]) => ({ id: `faq:${q}`, title: q, roles: ["secretary"] as WorkspaceKey[], body: a })),
  { id: "faq:forgot-password-staff", title: "I forgot my password.", roles: ["municipal", "admin"], body: "Ask your municipal IT administrator to reset it. IT administrators ask the system superadmin." },
  { id: "faq:locked", title: "My account is locked.", roles: ["secretary", "municipal", "admin", "superadmin"], body: "After 5 wrong passwords an account locks for 15 minutes. Wait, or ask your IT administrator to unlock it." },
  { id: "faq:who-sees-what", title: "Who can see which records?", roles: ["municipal", "admin", "superadmin"], body: "Barangay secretaries see only their barangay. Municipal personnel see their municipality's totals and the reports barangays submit, not individual resident records. IT administrators manage accounts for their municipality. The superadmin manages municipalities and administrators. VAWC cases are visible only to users granted VAWC access." },
  { id: "faq:theme", title: "How do I switch to dark mode?", roles: ["secretary", "municipal", "admin", "superadmin"], body: "Use the sun/moon switch in the top bar (on phones it is in the account menu under your name)." },
  { id: "faq:data-privacy", title: "How is resident data protected?", roles: ["secretary", "municipal", "admin", "superadmin"], body: "The system follows the Data Privacy Act (RA 10173): accounts are created only by administrators, each role sees only its own scope, failed sign-ins lock the account, and every sign-in, export, and change is in the audit log." },
];

const PAGES: KnowledgeDoc[] = (Object.keys(WORKSPACES) as WorkspaceKey[]).flatMap((ws) =>
  flattenWs(WORKSPACES[ws]).map((e) => ({
    id: `page:${e.href}`,
    title: e.parent ? `${e.parent} > ${e.title}` : e.title,
    roles: [ws],
    href: e.href,
    body: noteFor(e.href),
  })),
);

export const KNOWLEDGE: KnowledgeDoc[] = [...GUIDES, ...FAQS, ...PAGES];

/* ---------- Retrieval ---------- */

const STOP = new Set("a an the and or of to in on for with how do does i my me we our is are can what where which who why when it this that be get to from at by as about".split(" "));
/** Common words people use for the same thing. */
const SYNONYMS: Record<string, string[]> = {
  cert: ["certificate"], certificate: ["clearance", "indigency", "residency", "document"], clearance: ["certificate"],
  kp: ["katarungang", "pambarangay", "lupon", "mediation"], lupon: ["kp", "katarungang"], case: ["blotter", "complaint"],
  complaint: ["blotter", "case"], incident: ["blotter"], senior: ["seniors", "classification", "sector"], pwd: ["classification", "sector"],
  "4ps": ["classification", "sector"], resident: ["residents", "person"], household: ["households", "family"],
  report: ["reports", "submission"], submit: ["submission", "submissions"], password: ["reset", "locked"], account: ["user", "accounts"],
  user: ["account"], login: ["sign", "password"], vawc: ["9262", "confidential"], announcement: ["advisory", "announcements"],
  print: ["reprint"], fee: ["fees"], onboard: ["activate", "onboarding"], dark: ["theme"], light: ["theme"],
};
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");
const tokens = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

/** Keyword search over the knowledge base, limited to what this workspace can use. Titles weigh more than bodies. */
export function searchKnowledge(query: string, ws: WorkspaceKey, limit = 5) {
  const q = new Set<string>();
  for (const t of tokens(query)) {
    q.add(stem(t));
    for (const s of SYNONYMS[t] ?? []) q.add(stem(s));
  }
  if (q.size === 0) return [];
  return KNOWLEDGE.filter((d) => d.roles.includes(ws))
    .map((d) => {
      const title = new Set(tokens(d.title).map(stem));
      const body = tokens(d.body).map(stem);
      let score = 0;
      for (const t of q) {
        if (title.has(t)) score += 3;
        score += Math.min(2, body.filter((b) => b === t).length);
      }
      if (d.id.startsWith("guide:")) score *= 1.3;
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ d }) => d);
}
