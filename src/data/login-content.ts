import type { LoginRole } from "@/types/login";

export const loginRoles: { id: LoginRole; label: string; system: string }[] = [
  {
    id: "secretary",
    label: "Barangay Secretary",
    system: "Barangay Information System",
  },
  { id: "municipal", label: "Municipal Personnel", system: "Municipal System" },
  { id: "superadmin", label: "Superadmin", system: "Both systems" },
];

export const roleCopy: Record<LoginRole, { title: string; text: string }> = {
  secretary: {
    title: "Which barangay do you serve?",
    text: "Choose your region, province, municipality, and barangay. Then sign in to the Barangay Information System.",
  },
  municipal: {
    title: "Which municipality do you serve?",
    text: "Choose your region, province, and municipality. Then sign in to the Municipal System.",
  },
  superadmin: {
    title: "Welcome back, Superadmin.",
    text: "Sign in to manage accounts, access, and settings across both systems.",
  },
};
