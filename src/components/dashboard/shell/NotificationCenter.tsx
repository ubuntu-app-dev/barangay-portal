"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import Popover from "@/components/dashboard/ui/Popover";
import { WORKSPACES, type WorkspaceKey } from "@/config/workspaces";
import { formatDateTime } from "@/lib/dashboard/format";
import { markAllNotificationsRead, markNotificationRead } from "@/server/actions/notifications";
import type { AppNotification } from "@/types/dashboard";

export default function NotificationCenter({
  ws,
  items,
}: {
  ws: WorkspaceKey;
  items: AppNotification[];
}) {
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.read).map((i) => i.id)),
  );
  const unread = items.filter((i) => !readIds.has(i.id)).length;
  // Optimistic: the dot disappears at once, the server records it in the background.
  const markRead = (id: string) => {
    setReadIds((s) => new Set(s).add(id));
    void markNotificationRead(id);
  };

  return (
    <Popover
      label={`Notifications, ${unread} unread`}
      buttonClassName="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-ground-muted"
      button={
        <>
          <Icon name="bell" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-flag-red px-1 text-[11px] font-bold text-white"
            >
              {unread}
            </span>
          )}
        </>
      }
      panelClassName="w-[min(92vw,380px)]"
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <p className="font-display text-[15px] font-bold">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => {
                  setReadIds(new Set(items.map((i) => i.id)));
                  void markAllNotificationsRead();
                }}
                className="text-[13px] font-semibold text-dash-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-[14px] text-ink-secondary">
              You have no notifications.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-rule overflow-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      markRead(n.id);
                      close();
                    }}
                    className="flex gap-3 px-4 py-3 hover:bg-ground-muted"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${readIds.has(n.id) ? "bg-transparent" : "bg-flag-red"}`}
                    />
                    <span className="block">
                      <span className="block text-[14px] font-semibold">
                        {n.title}
                        {!readIds.has(n.id) && (
                          <span className="visually-hidden"> (unread)</span>
                        )}
                      </span>
                      <span className="block text-[13px] text-ink-secondary">
                        {n.body}
                      </span>
                      <span className="mt-1 block text-[12px] text-ink-secondary">
                        {formatDateTime(n.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-rule px-4 py-3 text-center">
            <Link
              href={WORKSPACES[ws].links.notifications}
              onClick={close}
              className="text-[13px] font-semibold text-dash-primary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </Popover>
  );
}
