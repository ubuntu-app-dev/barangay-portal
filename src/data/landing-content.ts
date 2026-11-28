/**
 * Every piece of text on the landing page. Edit here; the components only lay it out.
 */
import type {
  FeatureCategory,
  Highlight,
  Principle,
  Screen,
  Step,
} from "@/types/landing";

export const hero = {
  eyebrow: "Barangay and Municipal Information System",
  title: "Building a More Connected and Efficient Local Government.",
  /** Words in the title shown in the brand blue. */
  highlight: ["Connected", "Efficient"],
  text: "A centralized digital platform connecting municipal offices and barangay administrations through streamlined information management, improved coordination, and technology-driven public services.",
  primary: "Access the Portal",
  secondary: "Explore the Platform",
  facts: [
    "Official PSGC locations",
    "Role-based access",
    "Built around RA 10173",
  ],
};

export const about = {
  eyebrow: "About the Platform",
  title: "Empowering Local Governance Through Digital Transformation.",
  paragraphs: [
    "The platform is designed to strengthen the connection between municipal offices and barangay administrations by providing a unified environment for managing information, coordinating operations, and supporting administrative processes.",
    "Through digital solutions, local government personnel can work more efficiently, maintain organized records, and improve collaboration across different levels of local government.",
  ],
};

export const principles: Principle[] = [
  {
    title: "Connectivity",
    icon: "network",
    text: "Barangays and municipal offices share one platform, so reports, announcements, and records move between them without paper or re-encoding.",
  },
  {
    title: "Organization",
    icon: "folders",
    text: "Residents, households, documents, and cases are kept as structured records with a full change history, so information is easy to find and to trust.",
  },
  {
    title: "Efficiency",
    icon: "zap",
    text: "Certificates, reports, and municipal summaries are generated from records already in the system, which cuts repeated work and waiting time.",
  },
];

export const features = {
  eyebrow: "Platform Features",
  title: "Tools for every level of local government.",
  text: "Each user signs in to a workspace built for their role, all drawing from the same records.",
};

export const featureCategories: FeatureCategory[] = [
  {
    title: "Barangay Records and Services",
    audience: "Barangay Secretary",
    icon: "records",
    text: "Everything the barangay hall keeps and issues, in one organized place.",
    items: [
      "Resident, household, and family records with sector lists (seniors, PWD, solo parents, 4Ps)",
      "Certificates and clearances with control numbers, live preview, and printing",
      "Blotter, complaints, and Katarungang Pambarangay case tracking",
      "Community resources, animal registry, and water service records",
    ],
  },
  {
    title: "Municipal Coordination and Reporting",
    audience: "Municipal Personnel",
    icon: "municipal",
    text: "A municipal view of every barangay, built from what they submit.",
    items: [
      "Report requirements with due dates sent to every barangay",
      "Review submissions, then approve or return them with remarks",
      "Compliance tracking: submitted, late, or not yet",
      "Consolidated reports summed across all barangays",
    ],
  },
  {
    title: "Communication and Announcements",
    audience: "All users",
    icon: "megaphone",
    text: "Timely information that reaches the right people.",
    items: [
      "Municipal announcements and urgent advisories",
      "Barangay announcements with pinning and expiry dates",
      "Notifications for submissions, returns, and deadlines",
      "Read tracking, so offices know who has seen a notice",
    ],
  },
  {
    title: "Administration and Security",
    audience: "IT Administrator and Superadmin",
    icon: "shield",
    text: "Controlled access and a clear record of every action.",
    items: [
      "Separate workspaces for four user levels",
      "Account management with temporary passwords and lockout",
      "Municipality and barangay onboarding from the official PSGC list",
      "Audit log of every sign-in, export, and record change",
    ],
  },
];

export const how = {
  eyebrow: "How It Works",
  title: "From the barangay hall to the municipal hall, in four steps.",
  text: "Each step happens where it belongs, and the next one starts from the same records.",
};

export const steps: Step[] = [
  {
    title: "Set up",
    actor: "Superadmin and IT Administrator",
    icon: "setup",
    text: "The municipality and its barangays are added from the official PSGC list, and each user gets an account for their role.",
  },
  {
    title: "Record",
    actor: "Barangay Secretary",
    icon: "secretary",
    text: "The barangay keeps resident records, issues certificates, and logs incidents as part of its daily work.",
  },
  {
    title: "Submit",
    actor: "Barangay Secretary",
    icon: "send",
    text: "When the municipality asks for a report, the barangay submits figures generated from its own records.",
  },
  {
    title: "Review and consolidate",
    actor: "Municipal Personnel",
    icon: "review",
    text: "Municipal offices review each submission, return it if needed, and combine all barangays into one report.",
  },
];

export const gallery = {
  eyebrow: "System Preview",
  title: "Explore the Platform",
  text: "Real screens from LGU Connect, shown with sample data.",
};

export const screens: Screen[] = [
  {
    title: "Municipal Dashboard",
    src: "/screenshots/municipal-dashboard.jpg",
    alt: "Municipal dashboard with totals across barangays, requirements in progress, and the latest submissions",
    text: "Totals across every barangay, report requirements in progress, and the latest submissions to review.",
  },
  {
    title: "Barangay Dashboard",
    src: "/screenshots/barangay-dashboard.jpg",
    alt: "Barangay Secretary dashboard with resident counts, tasks, and announcements",
    text: "The Barangay Secretary's day at a glance: live counts, tasks with deadlines, and announcements.",
  },
  {
    title: "Resident Information Management",
    src: "/screenshots/resident-records.jpg",
    alt: "Resident records list with search and filters",
    text: "Search, filter, and update resident records, with households, families, and sector lists.",
  },
  {
    title: "Reports and Analytics",
    src: "/screenshots/reports-analytics.jpg",
    alt: "Resident demographics report with charts and tables",
    text: "Reports generated from the barangay's records, ready to print or submit to the municipality.",
  },
  {
    title: "User Management",
    src: "/screenshots/user-management.jpg",
    alt: "User accounts list for the municipal IT administrator",
    text: "The IT administrator creates accounts, sets roles, and suspends or unlocks access.",
  },
];

export const security = {
  eyebrow: "Security and Accessibility",
  title: "Designed for Responsible Digital Governance.",
  text: "The platform supports controlled access and organized information management through authorized user accounts and role-based access.",
  note: "Resident records are personal information. The platform follows the principles of the Data Privacy Act of 2012 (RA 10173).",
};

/** Only list protections the application actually has. */
export const securityHighlights: Highlight[] = [
  {
    title: "Role-based access control",
    icon: "shield",
    text: "Each user level has its own workspace and sees only its own barangay or municipality. VAWC cases need a separate permission.",
  },
  {
    title: "Authorized user accounts",
    icon: "key",
    text: "Accounts are created by administrators, never by self sign-up. Temporary passwords must be changed on first sign-in, and repeated failed sign-ins lock the account.",
  },
  {
    title: "Organized digital records",
    icon: "folders",
    text: "Records are structured and keep a change history, so every edit shows who made it and what changed.",
  },
  {
    title: "Centralized administration",
    icon: "setup",
    text: "Accounts, onboarding, and system settings are managed in one place, with an audit log of sign-ins, exports, and changes.",
  },
];

export const contact = {
  eyebrow: "Contact",
  title: "Need help or want to bring your LGU on board?",
  text: "Here is who to reach for each kind of request.",
  cards: [
    {
      title: "Account access and passwords",
      text: "Barangay secretaries and municipal staff: contact your Municipal IT Administrator. They create accounts, reset passwords, and unlock accounts.",
    },
    {
      title: "Onboarding your municipality",
      text: "Municipalities that want to use the platform can contact the system administrator to set up their barangays and offices.",
    },
  ],
  /**
   * Shown only when filled in. Use the real office details of whoever runs the platform.
   */
  details: {
    office: "",
    email: "",
    phone: "",
    hours: "",
  },
  cta: {
    title: "Ready to get started?",
    text: "Barangay secretaries, municipal personnel, and administrators all sign in from the same place.",
    button: "Login to Portal",
    note: "No account yet? Ask your Municipal IT Administrator.",
  },
};
