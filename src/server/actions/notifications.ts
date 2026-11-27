"use server";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth/staff";
import { db } from "@/server/db";
import { ok } from "@/server/forms";
import { refreshDashboard } from "./shared";

/** Notifications belong to one user, whatever their role. */
export async function markNotificationRead(id: string): Promise<void> {
  const u = await requireUser();
  await db.notification.updateMany({ where: { id, userId: u.id, readAt: null }, data: { readAt: new Date() } });
  refreshDashboard();
}

export async function markAllNotificationsRead(): Promise<void> {
  const u = await requireUser();
  await db.notification.updateMany({ where: { userId: u.id, readAt: null }, data: { readAt: new Date() } });
  refreshDashboard();
}

export async function deleteNotification(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireUser();
  await db.notification.deleteMany({ where: { id: String(fd.get("id") ?? ""), userId: u.id } });
  refreshDashboard();
  return ok("Notification removed.");
}
