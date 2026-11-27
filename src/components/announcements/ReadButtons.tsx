"use client";
import { useTransition } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { markAnnouncementRead } from "@/server/actions/announcements";
import { markAllNotificationsRead, markNotificationRead } from "@/server/actions/notifications";

export function MarkAnnouncementRead({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => markAnnouncementRead(id))} className="btn btn-ghost btn-sm">
      <Icon name="check" className="h-3.5 w-3.5" /> {pending ? "Saving…" : "Mark as read"}
    </button>
  );
}

export function MarkNotificationRead({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => markNotificationRead(id))} className="btn btn-ghost btn-sm">
      <Icon name="check" className="h-3.5 w-3.5" /> Mark read
    </button>
  );
}

export function MarkAllRead() {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => markAllNotificationsRead())} className="btn btn-secondary">
      <Icon name="checkCircle" className="h-4 w-4" /> {pending ? "Marking…" : "Mark all as read"}
    </button>
  );
}
