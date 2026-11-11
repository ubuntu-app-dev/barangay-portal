import type { Role, SystemInfo } from "@/types/landing";

export const systems: SystemInfo[] = [
  {
    id: "barangay",
    name: "Barangay Information System",
    audience: "For the Barangay Secretary",
    text: "The front line of the LGU. Records are created and kept current where they happen: in the barangay.",
    features: [
      "Resident and household records",
      "Certificates and clearances",
      "Community and incident records",
    ],
  },
  {
    id: "municipal",
    name: "Municipal System",
    audience: "For Municipal Personnel",
    text: "The municipal view of every barangay, so decisions rest on consolidated and consistent data.",
    features: [
      "Consolidated barangay data",
      "Review and verification",
      "Municipal reports and monitoring",
    ],
  },
];

export const roles: Role[] = [
  {
    level: "Level 1",
    tier: "Barangay Information System",
    name: "Barangay Secretary",
    scope: "Works within one barangay",
    text: "Keeps the barangay's records current and is the day-to-day entry point of the platform.",
    tasks: [
      "Encode and update barangay records",
      "Prepare and issue documents",
      "Submit data for municipal review",
    ],
  },
  {
    level: "Level 2",
    tier: "Municipal System",
    name: "Municipal Personnel",
    scope: "Oversees the barangays of a municipality",
    text: "Reviews what each barangay submits so the municipality works from one consistent picture.",
    tasks: [
      "View records across barangays",
      "Review and verify submissions",
      "Prepare municipal-level reports",
    ],
  },
  {
    level: "Level 3",
    tier: "Both systems",
    name: "Superadmin",
    scope: "Governs the whole platform",
    text: "Controls accounts, access, and configuration across the Barangay and Municipal systems.",
    tasks: [
      "Create and manage user accounts",
      "Assign roles and access levels",
      "Configure and maintain the platform",
    ],
  },
];

export const steps = [
  {
    title: "Record",
    text: "The Barangay Secretary enters and maintains records in the Barangay Information System.",
  },
  {
    title: "Consolidate",
    text: "Municipal Personnel review submissions across barangays in the Municipal System.",
  },
  {
    title: "Govern",
    text: "The Superadmin manages accounts, access, and settings across both systems.",
  },
];

export const benefits = [
  {
    title: "One source of records",
    text: "Barangay and municipal offices work from the same central platform.",
  },
  {
    title: "Access that fits the job",
    text: "Each user level gets the tools its role needs.",
  },
  {
    title: "Consistent data",
    text: "A shared structure makes municipal review easier.",
  },
  {
    title: "Managed in one place",
    text: "Accounts and settings are maintained centrally.",
  },
];

export const privacyPrinciples = [
  {
    title: "Transparency",
    text: "People can know what information is collected and why.",
  },
  {
    title: "Legitimate purpose",
    text: "Records are collected only for declared barangay and municipal functions.",
  },
  {
    title: "Proportionality",
    text: "Only the information a task needs is collected and shown.",
  },
  {
    title: "Role-based access",
    text: "Each user level sees only what its role requires.",
  },
];

export const heroHeadline = {
  lead: "One connected system for barangay and municipal",
  words: ["governance", "records", "reports", "services"],
};
