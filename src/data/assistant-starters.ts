import type { WorkspaceKey } from "@/config/workspaces";

/** Suggested first questions shown in the chat widget, per workspace. */
export const STARTERS: Record<WorkspaceKey, string[]> = {
  secretary: ["What needs my attention today?", "How do I issue a barangay clearance?", "How many senior citizens do we have?", "Which reports are due to the municipality?"],
  municipal: ["Which barangays haven't submitted yet?", "How do I return a report for revision?", "What is the total population of the municipality?", "How many documents were issued this month?"],
  admin: ["How do I create a secretary account?", "Are there locked accounts?", "Which barangays have no secretary yet?", "How do I give VAWC access?"],
  superadmin: ["How do I onboard a municipality?", "How many failed sign-ins this week?", "How do I show a maintenance banner?", "How many barangays are onboarded?"],
};
