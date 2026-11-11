export type LevelId = "secretary" | "municipal" | "superadmin";

export type LevelItem = {
  id: LevelId;
  level: string;
  name: string;
  scope: string;
  system: string;
  summary: string;
  tasks: string[];
};
