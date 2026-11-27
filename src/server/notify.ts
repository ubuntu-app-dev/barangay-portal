import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

type Tx = Prisma.TransactionClient | typeof db;

/**
 * Sends one notification to every active user matching `where`, skipping those who turned this kind off
 * in Notification Preferences (missing preference = on).
 */
export async function notifyUsers(tx: Tx, where: Prisma.UserWhereInput, n: { title: string; body: string; href: string }, pref?: "submissions" | "announcements" | "advisories" | "requests") {
  const users = await tx.user.findMany({ where: { ...where, status: "ACTIVE" }, select: { id: true, preferences: true } });
  const wanted = users.filter((u) => {
    if (!pref) return true;
    const p = u.preferences && typeof u.preferences === "object" ? (u.preferences as Record<string, unknown>) : {};
    return p[pref] !== false;
  });
  if (wanted.length) await tx.notification.createMany({ data: wanted.map((u) => ({ userId: u.id, title: n.title.slice(0, 200), body: n.body.slice(0, 500), href: n.href })) });
  return wanted.length;
}
