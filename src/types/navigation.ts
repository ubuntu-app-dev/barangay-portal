import type { IconName } from "@/components/dashboard/ui/icon-paths";

/** `label` is the short sidebar text; `title` is the full page name used in headings, breadcrumbs and search. */
export type NavChild = {
  label: string;
  title: string;
  slug: string;
  requires?: string;
};
export type NavItem = {
  id: string;
  label: string;
  title: string;
  icon: IconName;
  slug: string;
  children?: NavChild[];
};
export type NavSection = { title: string; items: NavItem[] };
