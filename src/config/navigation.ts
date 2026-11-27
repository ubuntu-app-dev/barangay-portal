import { slugify } from "@/lib/slug";
import type { NavChild, NavItem, NavSection } from "@/types/navigation";

const c = (
  label: string,
  title: string,
  extra: Partial<NavChild> = {},
): NavChild => ({ label, title, slug: slugify(title), ...extra });

export const navSections: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        title: "Dashboard",
        icon: "dashboard",
        slug: "",
      },
    ],
  },
  {
    title: "Barangay Management",
    items: [
      {
        id: "profile",
        label: "Profile",
        title: "Barangay Profile",
        icon: "building",
        slug: "barangay-profile",
        children: [
          c("Information", "Barangay Information"),
          c("Officials", "Barangay Officials"),
          c("Organization", "Organizational Information"),
          c("Contacts", "Barangay Contact Details"),
        ],
      },
      {
        id: "residents",
        label: "Residents",
        title: "Resident Management",
        icon: "users",
        slug: "resident-management",
        children: [
          c("Records", "Resident Records"),
          c("Add Resident", "Add New Resident"),
          c("Households", "Household Records"),
          c("Families", "Family Composition"),
          c("Classification", "Resident Classification"),
        ],
      },
      {
        id: "documents",
        label: "Documents",
        title: "Document Management",
        icon: "file",
        slug: "document-management",
        children: [
          c("Requests", "Certificate Requests"),
          c("Issuance", "Certificate Issuance"),
          c("Clearance", "Barangay Clearance"),
          c("Indigency", "Certificate of Indigency"),
          c("Residency", "Certificate of Residency"),
          c("Good Moral", "Certificate of Good Moral Character"),
          c("Other Documents", "Other Barangay Documents"),
          c("History", "Issuance History"),
        ],
      },
      {
        id: "blotter",
        label: "Blotter",
        title: "Blotter and Incident Management",
        icon: "shield",
        slug: "blotter-and-incident-management",
        children: [
          c("Records", "Blotter Records"),
          c("New Incident", "New Incident Report"),
          c("Complaints", "Complaint Records"),
          c("Cases", "Case Monitoring"),
          c("Katarungang Pambarangay", "Katarungang Pambarangay"),
          c("VAWC", "VAWC Records", {
            slug: "vawc-records",
            requires: "vawc:view",
          }),
        ],
      },
      {
        id: "community",
        label: "Community",
        title: "Community Resources",
        icon: "leaf",
        slug: "community-resources",
        children: [
          c("Animals", "Animal Records and Tracking"),
          c("Water Service", "Water Service Classification"),
          c("Resources", "Community Resource Records"),
        ],
      },
    ],
  },
  {
    title: "Reports and Coordination",
    items: [
      {
        id: "reports",
        label: "Reports",
        title: "Reports and Analytics",
        icon: "chart",
        slug: "reports-and-analytics",
        children: [
          c("Demographics", "Resident Demographics"),
          c("Household Stats", "Household Statistics"),
          c("Certificates", "Certificate Issuance Reports"),
          c("Incidents", "Blotter and Incident Reports"),
          c("Resources", "Community Resource Reports"),
          c("Generate", "Generate Reports"),
        ],
      },
      {
        id: "submissions",
        label: "Submissions",
        title: "Municipal Submissions",
        icon: "send",
        slug: "municipal-submissions",
        children: [
          c("Submit", "Submit Reports"),
          c("History", "Submission History"),
          c("Pending", "Pending Submissions"),
          c("Status", "Submission Status"),
        ],
      },
      {
        id: "announcements",
        label: "Announcements",
        title: "Announcements and Communications",
        icon: "megaphone",
        slug: "announcements-and-communications",
        children: [
          c("Municipal", "Municipal Announcements"),
          c("Barangay", "Barangay Announcements"),
          c("Notifications", "Notifications"),
          c("Advisories", "Important Advisories"),
        ],
      },
    ],
  },
  {
    title: "Account and System",
    items: [
      {
        id: "activity",
        label: "Activity",
        title: "Activity History",
        icon: "history",
        slug: "activity-history",
        children: [
          c("Recent", "Recent Activities"),
          c("Updates", "Record Update History"),
        ],
      },
      {
        id: "settings",
        label: "Settings",
        title: "Settings",
        icon: "settings",
        slug: "settings",
        children: [
          c("Account", "Account Profile"),
          c("Password", "Change Password"),
          c("Preferences", "Notification Preferences"),
        ],
      },
    ],
  },
];

const BASE = "/dashboard";
export const hrefOf = (item: NavItem, c?: NavChild) =>
  `${BASE}${item.slug ? `/${item.slug}` : ""}${c ? `/${c.slug}` : ""}`;

/** Pages the dashboard links to directly. Each one is checked against the config above. */
export const routes = {
  home: BASE,
  help: `${BASE}/help`,
  addResident: `${BASE}/resident-management/add-new-resident`,
  households: `${BASE}/resident-management/household-records`,
  newHousehold: `${BASE}/resident-management/household-records/new`,
  residents: `${BASE}/resident-management/resident-records`,
  families: `${BASE}/resident-management/family-composition`,
  classification: `${BASE}/resident-management/resident-classification`,
  printDocument: `${BASE}/document-management/print`,
  complaints: `${BASE}/blotter-and-incident-management/complaint-records`,
  cases: `${BASE}/blotter-and-incident-management/case-monitoring`,
  kp: `${BASE}/blotter-and-incident-management/katarungang-pambarangay`,
  vawc: `${BASE}/blotter-and-incident-management/vawc-records`,
  animals: `${BASE}/community-resources/animal-records-and-tracking`,
  water: `${BASE}/community-resources/water-service-classification`,
  resources: `${BASE}/community-resources/community-resource-records`,
  submissionStatus: `${BASE}/municipal-submissions/submission-status`,
  barangayAnnouncements: `${BASE}/announcements-and-communications/barangay-announcements`,
  advisories: `${BASE}/announcements-and-communications/important-advisories`,
  recordUpdates: `${BASE}/activity-history/record-update-history`,
  officials: `${BASE}/barangay-profile/barangay-officials`,
  organization: `${BASE}/barangay-profile/organizational-information`,
  contacts: `${BASE}/barangay-profile/barangay-contact-details`,
  issueCertificate: `${BASE}/document-management/certificate-issuance`,
  issuanceHistory: `${BASE}/document-management/issuance-history`,
  certificateRequests: `${BASE}/document-management/certificate-requests`,
  newIncident: `${BASE}/blotter-and-incident-management/new-incident-report`,
  blotter: `${BASE}/blotter-and-incident-management/blotter-records`,
  submitReport: `${BASE}/municipal-submissions/submit-reports`,
  submissionHistory: `${BASE}/municipal-submissions/submission-history`,
  pendingSubmissions: `${BASE}/municipal-submissions/pending-submissions`,
  generateReport: `${BASE}/reports-and-analytics/generate-reports`,
  demographics: `${BASE}/reports-and-analytics/resident-demographics`,
  profile: `${BASE}/barangay-profile/barangay-information`,
  municipalAnnouncements: `${BASE}/announcements-and-communications/municipal-announcements`,
  notifications: `${BASE}/announcements-and-communications/notifications`,
  activities: `${BASE}/activity-history/recent-activities`,
  accountProfile: `${BASE}/settings/account-profile`,
  accountSettings: `${BASE}/settings/notification-preferences`,
  changePassword: `${BASE}/settings/change-password`,
} as const;

export type NavEntry = {
  label: string;
  title: string;
  parent?: string;
  href: string;
  requires?: string;
};

/** Every page in the menu, flattened (used by search, breadcrumbs, and the placeholder pages). */
export function flattenNav(): NavEntry[] {
  const entries: NavEntry[] = [
    { label: "Help", title: "Help and Support", href: routes.help },
  ];
  for (const section of navSections) {
    for (const item of section.items) {
      entries.push({
        label: item.label,
        title: item.title,
        href: hrefOf(item),
      });
      for (const c of item.children ?? [])
        entries.push({
          label: c.label,
          title: c.title,
          parent: item.title,
          href: hrefOf(item, c),
          requires: c.requires,
        });
    }
  }
  return entries;
}

export const findNavEntry = (href: string) =>
  flattenNav().find((e) => e.href === href) ?? null;

/** The deepest menu page that contains this path (for detail pages like …/resident-records/abc123/edit). */
export function findNavAncestor(pathname: string): { entry: NavEntry; rest: string[] } | null {
  let best: NavEntry | null = null;
  for (const e of flattenNav())
    if ((pathname === e.href || pathname.startsWith(`${e.href}/`)) && e.href !== BASE && (!best || e.href.length > best.href.length)) best = e;
  if (!best) return null;
  return { entry: best, rest: pathname.slice(best.href.length).split("/").filter(Boolean) };
}
