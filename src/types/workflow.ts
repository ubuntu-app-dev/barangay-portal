import type { LevelId } from "@/types/levels";

export type WorkflowStep = {
  id: LevelId;
  title: string;
  text: string;
  actor: string;
  system: string;
};

export type WorkflowBenefit = { title: string; text: string };
