import type { Stat } from "@/types/landing";

/**
 * SAMPLE FIGURES. Replace every value with real numbers (or load them from your database)
 * before presenting. Set statsAreSample to false afterwards to hide the on-page note.
 */
export const statsAreSample = true;

export const stats: Stat[] = [
  {
    id: "barangays",
    label: "Barangays using the system",
    value: 24,
    icon: "barangay",
  },
  {
    id: "municipalities",
    label: "Municipalities connected",
    value: 3,
    icon: "municipality",
  },
  {
    id: "residents",
    label: "Resident records managed",
    value: 18500,
    icon: "residents",
  },
  {
    id: "documents",
    label: "Certificates and clearances issued",
    value: 6200,
    icon: "documents",
  },
  {
    id: "reports",
    label: "Reports submitted to the municipality",
    value: 310,
    icon: "reports",
  },
  { id: "users", label: "Active system users", value: 96, icon: "users" },
];
