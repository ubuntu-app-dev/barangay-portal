import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { PRIORITY } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import type { Session } from "@/types/dashboard";

/** Municipal and system-wide announcements this barangay can see (published, not expired). */
export async function listMunicipalAnnouncements(session: Session, sp: SearchParams, advisoriesOnly = false) {
  const page = pageOf(sp.page);
  const priority = oneOf(str(sp.priority), PRIORITY);
  const office = str(sp.office);
  const now = new Date();
  const where: Prisma.AnnouncementWhereInput = {
    status: "PUBLISHED",
    OR: [{ scope: "SYSTEM" }, { scope: "MUNICIPAL", municipalityCode: session.barangay.municipalityCode }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, ...words(str(sp.q)).map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" as const } }, { body: { contains: t, mode: "insensitive" as const } }] }))],
    ...(advisoriesOnly ? { isAdvisory: true } : {}),
    ...(priority ? { priority } : {}),
    ...(office ? { officeId: office } : {}),
  };
  const [rows, total] = await Promise.all([
    db.announcement.findMany({
      where,
      include: { office: true, reads: { where: { userId: session.user.id } } },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.announcement.count({ where }),
  ]);
  return { rows: rows.map((r) => ({ ...r, read: r.reads.length > 0 })), total, page, pageSize: PAGE_SIZE };
}

export async function listBarangayAnnouncements(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const where: Prisma.AnnouncementWhereInput = {
    scope: "BARANGAY",
    barangayCode: session.barangay.code,
    AND: words(str(sp.q)).map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" } }, { body: { contains: t, mode: "insensitive" } }] })),
  };
  const [rows, total] = await Promise.all([
    db.announcement.findMany({ where, orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.announcement.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function listNotifications(userId: string, sp: SearchParams) {
  const page = pageOf(sp.page);
  const unread = str(sp.show) === "unread";
  const where: Prisma.NotificationWhereInput = { userId, ...(unread ? { readAt: null } : {}) };
  const [rows, total, unreadCount] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.notification.count({ where }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE, unreadCount };
}
