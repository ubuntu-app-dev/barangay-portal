import { slugify } from "@/lib/slug";
import type { NavChild, NavItem, NavSection } from "@/types/navigation";
import { navSections as secretarySections } from "./navigation";

/** The four signed-in areas. The key is passed from server layouts to the client shell. */
export type WorkspaceKey = "secretary" | "municipal" | "admin" | "superadmin";

export type Workspace = {
  key: WorkspaceKey;
  /** Shown under the product name in the sidebar. */
  label: string;
  base: string;
  sections: NavSection[];
  links: { help?: string; notifications: string; account: string; password: string; preferences: string };
  /** Search residents and households (secretary only), or pages only. */
  searchRecords: boolean;
};

const c = (label: string, title: string, extra: Partial<NavChild> = {}): NavChild => ({ label, title, slug: slugify(title), ...extra });
const item = (id: string, label: string, title: string, icon: NavItem["icon"], slug: string, children?: NavChild[]): NavItem => ({ id, label, title, icon, slug, children });

const settings = item("settings", "Settings", "Settings", "settings", "settings", [c("Account", "Account Profile"), c("Password", "Change Password"), c("Preferences", "Notification Preferences")]);
const settingsLinks = (base: string) => ({
  notifications: `${base}/notifications`,
  account: `${base}/settings/account-profile`,
  password: `${base}/settings/change-password`,
  preferences: `${base}/settings/notification-preferences`,
});

export const WORKSPACES: Record<WorkspaceKey, Workspace> = {
  secretary: {
    key: "secretary",
    label: "Barangay Secretary",
    base: "/dashboard",
    sections: secretarySections,
    links: {
      help: "/dashboard/help",
      notifications: "/dashboard/announcements-and-communications/notifications",
      account: "/dashboard/settings/account-profile",
      password: "/dashboard/settings/change-password",
      preferences: "/dashboard/settings/notification-preferences",
    },
    searchRecords: true,
  },
  municipal: {
    key: "municipal",
    label: "Municipal Personnel",
    base: "/municipal",
    sections: [
      { title: "Main Menu", items: [item("overview", "Overview", "Overview", "dashboard", "")] },
      {
        title: "Barangay Reporting",
        items: [
          item("submissions", "Submissions", "Submissions from Barangays", "inbox", "submissions"),
          item("requirements", "Requirements", "Report Requirements", "clipboard", "requirements"),
          item("compliance", "Compliance", "Submission Compliance", "checkCircle", "compliance"),
        ],
      },
      {
        title: "Municipality",
        items: [
          item("barangays", "Barangays", "Barangays", "building", "barangays"),
          item("reports", "Consolidated Reports", "Consolidated Reports", "chart", "reports"),
          item("announcements", "Announcements", "Announcements and Advisories", "megaphone", "announcements"),
        ],
      },
      { title: "Account", items: [item("notifications", "Notifications", "Notifications", "bell", "notifications"), settings] },
    ],
    links: settingsLinks("/municipal"),
    searchRecords: false,
  },
  admin: {
    key: "admin",
    label: "Municipal IT Admin",
    base: "/admin",
    sections: [
      { title: "Main Menu", items: [item("overview", "Overview", "Overview", "dashboard", "")] },
      {
        title: "Administration",
        items: [
          item("users", "User Accounts", "User Accounts", "users", "users"),
          item("barangays", "Barangays", "Barangay Onboarding", "building", "barangays"),
          item("offices", "Offices", "Municipal Offices", "sitemap", "offices"),
          item("audit", "Audit Log", "Audit Log", "history", "audit"),
        ],
      },
      { title: "Account", items: [item("notifications", "Notifications", "Notifications", "bell", "notifications"), settings] },
    ],
    links: settingsLinks("/admin"),
    searchRecords: false,
  },
  superadmin: {
    key: "superadmin",
    label: "Superadmin",
    base: "/superadmin",
    sections: [
      { title: "Main Menu", items: [item("overview", "Overview", "Overview", "dashboard", "")] },
      {
        title: "System",
        items: [
          item("municipalities", "Municipalities", "Municipalities", "globe", "municipalities"),
          item("administrators", "Administrators", "Administrators", "key", "administrators"),
          item("system-settings", "System Settings", "System Settings", "settings", "system-settings"),
          item("audit", "Audit Log", "Audit Log", "history", "audit"),
        ],
      },
      { title: "Account", items: [item("notifications", "Notifications", "Notifications", "bell", "notifications"), settings] },
    ],
    links: settingsLinks("/superadmin"),
    searchRecords: false,
  },
};

export const hrefIn = (ws: Workspace, i: NavItem, ch?: NavChild) => `${ws.base}${i.slug ? `/${i.slug}` : ""}${ch ? `/${ch.slug}` : ""}`;

export type WsEntry = { label: string; title: string; parent?: string; href: string; requires?: string };

export function flattenWs(ws: Workspace): WsEntry[] {
  const out: WsEntry[] = ws.links.help ? [{ label: "Help", title: "Help and Support", href: ws.links.help }] : [];
  for (const s of ws.sections)
    for (const i of s.items) {
      out.push({ label: i.label, title: i.title, href: hrefIn(ws, i) });
      for (const ch of i.children ?? []) out.push({ label: ch.label, title: ch.title, parent: i.title, href: hrefIn(ws, i, ch), requires: ch.requires });
    }
  return out;
}
