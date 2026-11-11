import type { LevelItem } from "@/types/levels";

export const levelsHeading = {
  title: "Three user levels across two systems",
  text: "The barangay is the basic unit of Philippine local government. Barangay secretaries work in the Barangay Information System, municipal personnel in the Municipal System, and the Superadmin governs both.",
};

export const levels: LevelItem[] = [
  {
    id: "secretary",
    level: "Level 1",
    name: "Barangay Secretary",
    scope: "Works within one barangay",
    system: "Barangay Information System",
    summary:
      "Keeps the barangay's records current and is the day-to-day entry point of the platform.",
    tasks: [
      "Encode and update barangay records",
      "Prepare and issue documents",
      "Submit data for municipal review",
    ],
  },
  {
    id: "municipal",
    level: "Level 2",
    name: "Municipal Personnel",
    scope: "Oversees the barangays of a municipality",
    system: "Municipal System",
    summary:
      "Reviews what each barangay submits so the municipality works from one consistent picture.",
    tasks: [
      "View records across barangays",
      "Review and verify submissions",
      "Prepare municipal-level reports",
    ],
  },
  {
    id: "superadmin",
    level: "Level 3",
    name: "Superadmin",
    scope: "Governs the whole platform",
    system: "Both systems",
    summary:
      "Controls accounts, access, and configuration across the Barangay and Municipal systems.",
    tasks: [
      "Create and manage user accounts",
      "Assign roles and access levels",
      "Configure and maintain the platform",
    ],
  },
];
