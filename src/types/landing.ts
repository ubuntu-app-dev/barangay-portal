export type NavLink = { label: string; href: string };

export type IconName =
  | "network"
  | "folders"
  | "zap"
  | "records"
  | "municipal"
  | "megaphone"
  | "shield"
  | "setup"
  | "secretary"
  | "send"
  | "review"
  | "key";

export type Principle = { title: string; text: string; icon: IconName };

export type FeatureCategory = {
  title: string;
  audience: string;
  text: string;
  icon: IconName;
  items: string[];
};

export type Step = {
  title: string;
  actor: string;
  text: string;
  icon: IconName;
};

export type Screen = { title: string; src: string; alt: string; text: string };

export type Highlight = { title: string; text: string; icon: IconName };
