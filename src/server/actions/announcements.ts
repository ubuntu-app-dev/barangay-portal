"use server";
import { z } from "zod";
import { Priority, PublishStatus } from "@/generated/prisma/enums";
import type { ActionState } from "@/lib/action-state";
import { audit } from "@/server/audit";
import { db } from "@/server/db";
import { bool, enumOf, fail, ok, optDate, parse, req } from "@/server/forms";
import { authorize, refreshDashboard } from "./shared";

const schema = z.object({
  title: req("Title", 160),
  body: req("Message", 5000),
  priority: enumOf(Priority, "Priority"),
  status: enumOf(PublishStatus, "Status"),
  isPinned: bool,
  expiresAt: optDate,
});

export async function saveBarangayAnnouncement(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("announcements:barangay");
  const id = String(fd.get("id") ?? "");
  const p = parse(schema, fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const code = session.barangay.code;
  const data = { title: v.title, body: v.body, priority: v.priority, status: v.status, isPinned: v.isPinned, expiresAt: v.expiresAt ?? null };
  await db.$transaction(async (tx) => {
    if (id) {
      const a = await tx.announcement.findFirst({ where: { id, scope: "BARANGAY", barangayCode: code } });
      if (!a) throw new Error("not found");
      await tx.announcement.update({ where: { id }, data: { ...data, ...(a.status !== "PUBLISHED" && v.status === "PUBLISHED" ? { publishedAt: new Date() } : {}) } });
      await audit(session, { action: "UPDATE", entityType: "Announcement", entityId: id, summary: `Updated announcement "${v.title}"` }, tx);
    } else {
      const a = await tx.announcement.create({ data: { ...data, scope: "BARANGAY", barangayCode: code, authorId: session.user.id, publishedAt: new Date() } });
      await audit(session, { action: "CREATE", entityType: "Announcement", entityId: a.id, summary: `${v.status === "PUBLISHED" ? "Posted" : "Drafted"} announcement "${v.title}"` }, tx);
    }
  });
  refreshDashboard();
  return ok(id ? "Announcement updated." : v.status === "PUBLISHED" ? "Announcement posted." : "Draft saved.");
}

export async function deleteBarangayAnnouncement(_: ActionState, fd: FormData): Promise<ActionState> {
  const session = await authorize("announcements:barangay");
  const id = String(fd.get("id") ?? "");
  const a = await db.announcement.findFirst({ where: { id, scope: "BARANGAY", barangayCode: session.barangay.code } });
  if (!a) return fail("Already removed.");
  await db.$transaction(async (tx) => {
    await tx.announcement.delete({ where: { id } });
    await audit(session, { action: "DELETE", entityType: "Announcement", entityId: id, summary: `Deleted announcement "${a.title}"` }, tx);
  });
  refreshDashboard();
  return ok("Announcement deleted.");
}

/** Marks a municipal announcement as read by this user. */
export async function markAnnouncementRead(id: string): Promise<void> {
  const session = await authorize();
  const a = await db.announcement.findFirst({ where: { id, OR: [{ scope: "SYSTEM" }, { scope: "MUNICIPAL", municipalityCode: session.barangay.municipalityCode }, { scope: "BARANGAY", barangayCode: session.barangay.code }] } });
  if (!a) return;
  await db.announcementRead.upsert({ where: { announcementId_userId: { announcementId: id, userId: session.user.id } }, create: { announcementId: id, userId: session.user.id }, update: {} });
  refreshDashboard();
}

