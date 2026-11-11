import type { WorkflowBenefit, WorkflowStep } from "@/types/workflow";

export const workflowHeading = {
  title: "How information moves through the system",
  text: "Three steps, three roles, one record. Each step happens where it belongs, and the next one starts from the same data.",
};

export const workflowSteps: WorkflowStep[] = [
  {
    id: "secretary",
    title: "Record",
    actor: "Barangay Secretary",
    system: "Barangay Information System",
    text: "The Barangay Secretary enters and maintains records at the barangay hall.",
  },
  {
    id: "municipal",
    title: "Consolidate",
    actor: "Municipal Personnel",
    system: "Municipal System",
    text: "Municipal Personnel review what each barangay submits and consolidate it.",
  },
  {
    id: "superadmin",
    title: "Govern",
    actor: "Superadmin",
    system: "Both systems",
    text: "The Superadmin manages accounts, access, and settings across both systems.",
  },
];

export const workflowBenefits: WorkflowBenefit[] = [
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
