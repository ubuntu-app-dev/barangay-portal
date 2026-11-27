import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import type { WorkspaceKey } from "@/config/workspaces";
import type { Role } from "@/generated/prisma/enums";
import { requireRole, type StaffSession } from "@/lib/auth/staff";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";

const ROLES: Record<Exclude<WorkspaceKey, "secretary">, Role> = { municipal: "MUNICIPAL_PERSONNEL", admin: "MUNICIPAL_ADMIN", superadmin: "SUPERADMIN" };

/** Counts on menu items, per workspace. */
async function badges(ws: WorkspaceKey, u: StaffSession): Promise<Record<string, number>> {
  const unread = await db.notification.count({ where: { userId: u.id, readAt: null } });
  if (ws === "municipal") {
    const inbox = await db.submission.count({ where: { status: "SUBMITTED", barangay: { municipalityCode: u.municipality!.code }, ...(u.office ? { officeId: u.office.id } : {}) } });
    return { submissions: inbox, notifications: unread };
  }
  if (ws === "admin") {
    const locked = await db.user.count({ where: { lockedUntil: { gt: new Date() }, OR: [{ municipalityCode: u.municipality!.code }, { barangay: { municipalityCode: u.municipality!.code } }] } });
    return { users: locked, notifications: unread };
  }
  return { notifications: unread };
}

/** Signed-in frame for the municipal, admin, and superadmin workspaces. */
export default async function StaffLayout({ ws, children }: { ws: Exclude<WorkspaceKey, "secretary">; children: ReactNode }) {
  const u = await requireRole(ROLES[ws]);
  const [rows, counts, settings] = await Promise.all([db.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 15 }), badges(ws, u), getSettings()]);
  return (
    <DashboardShell
      ws={ws}
      user={{ name: u.name, position: u.position || u.office?.name || "", mustChangePassword: u.mustChangePassword }}
      scopeLabel={u.municipality ? `${u.municipality.name}, ${u.municipality.province}` : "All municipalities"}
      banner={settings.maintenanceBanner}
      permissions={u.permissions}
      notifications={rows.map((n) => ({ id: n.id, title: n.title, body: n.body, at: n.createdAt.toISOString(), read: !!n.readAt, href: n.href ?? `/${ws}/notifications` }))}
      badges={counts}
    >
      {children}
    </DashboardShell>
  );
}
