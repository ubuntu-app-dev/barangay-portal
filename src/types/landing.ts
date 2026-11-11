export type NavLink = { label: string; href: string };

export type Role = {
  level: string;
  tier: string;
  name: string;
  scope: string;
  text: string;
  tasks: string[];
};

export type SystemInfo = {
  id: string;
  name: string;
  audience: string;
  text: string;
  features: string[];
};

export type StatIconName =
  | "barangay"
  | "municipality"
  | "residents"
  | "documents"
  | "reports"
  | "users";

export type Stat = {
  id: string;
  label: string;
  value: number;
  icon: StatIconName;
  suffix?: string;
  decimals?: number;
};
