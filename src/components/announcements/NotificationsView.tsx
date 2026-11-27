import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import Tabs from "@/components/dashboard/ui/Tabs";
import { formatDateTime } from "@/lib/dashboard/format";
import { deleteNotification } from "@/server/actions/notifications";
import { flat, type SearchParams } from "@/server/params";
import { listNotifications } from "@/server/queries/announcements";
import { MarkAllRead, MarkNotificationRead } from "./ReadButtons";

/** Notifications for one user, in any workspace. */
export default async function NotificationsView({ userId, sp, basePath, prefsHref, eyebrow }: { userId: string; sp: SearchParams; basePath: string; prefsHref: string; eyebrow?: string }) {
  const list = await listNotifications(userId, sp);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} icon="bell" title="Notifications" description="Updates that need your attention.">
        {list.unreadCount > 0 && <MarkAllRead />}
        <Link href={prefsHref} className="btn btn-secondary">
          <Icon name="settings" className="h-4 w-4" /> Preferences
        </Link>
      </PageHeader>
      <Card title={`${list.unreadCount} unread`} icon="bell">
        <div className="mb-4">
          <Tabs label="Show" tabs={[{ label: "All", href: basePath }, { label: "Unread", href: `${basePath}?show=unread`, count: list.unreadCount }]} />
        </div>
        {list.rows.length === 0 ? (
          <EmptyState icon="bell" title="You're all caught up" text="New notifications will appear here." />
        ) : (
          <ul className="divide-y divide-rule/70">
            {list.rows.map((n) => (
              <li key={n.id} className={`flex flex-wrap items-start justify-between gap-3 px-2 py-3.5 ${n.readAt ? "" : "rounded-xl bg-dash-primary-soft/30"}`}>
                <div className="flex min-w-0 gap-3">
                  <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-dash-primary"}`} />
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {n.href ? (
                        <Link href={n.href} className="hover:text-dash-primary hover:underline">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                      {!n.readAt && <span className="visually-hidden"> (unread)</span>}
                    </p>
                    <p className="text-[14px] text-ink-secondary">{n.body}</p>
                    <p className="mt-0.5 text-[12px] text-ink-secondary">{formatDateTime(n.createdAt.toISOString())}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!n.readAt && <MarkNotificationRead id={n.id} />}
                  <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2" title="Remove this notification?" action={deleteNotification} hidden={{ id: n.id }} confirmLabel="Remove" icon="trash" />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={basePath} />
      </Card>
    </div>
  );
}
