import type { AccessRole, BentoCopy } from "@/types/systems";

export const systemsHeading = {
  title: "From barangay hall to municipal hall, one connected platform",
  text: "The Barangay Information System keeps records where they start. The Municipal System brings them together. One platform, three user levels.",
};

export const bento: Record<
  "barangay" | "municipal" | "flow" | "access",
  BentoCopy
> = {
  barangay: {
    tag: "Barangay Information System",
    title: "At the barangay hall: records kept, documents issued",
    text: "The Barangay Secretary maintains resident and household records and issues clearances and certificates, all in one place.",
    chips: [
      "Resident and household records",
      "Certificates and clearances",
      "Blotter and incident records",
    ],
  },
  municipal: {
    tag: "Municipal System",
    title: "At the municipal hall: every barangay in one view",
    text: "Municipal personnel review what each barangay submits and consolidate it into municipal reports.",
    chips: [
      "Consolidated barangay data",
      "Review and verification",
      "Municipal reports",
    ],
  },
  flow: {
    tag: "One platform",
    title: "Encode once. Use everywhere.",
    text: "The record a barangay encodes is the same record the municipality reviews. No re-typing, no mismatched copies.",
  },
  access: {
    tag: "Three user levels",
    title: "Each role opens its own workspace",
    text: "Pick a user level to see which system it works in.",
  },
};

export const accessRoles: AccessRole[] = [
  {
    id: "secretary",
    label: "Barangay Secretary",
    summary: "Encodes records and issues documents for one barangay.",
    barangay: true,
    municipal: false,
  },
  {
    id: "municipal",
    label: "Municipal Personnel",
    summary: "Reviews and consolidates the barangays within the municipality.",
    barangay: false,
    municipal: true,
  },
  {
    id: "superadmin",
    label: "Superadmin",
    summary: "Manages accounts, access, and settings across both systems.",
    barangay: true,
    municipal: true,
  },
];
