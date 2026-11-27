import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Announcement } from "@/types/dashboard";

export default function AnnouncementsPanel({ items, className = "" }: { items: Announcement[]; className?: string }) {
  return (
    <Card title="Municipal Announcements" icon="megaphone" actionLabel="View all" actionHref={routes.municipalAnnouncements} className={className}>
      {items.length === 0 ? (
        <EmptyState icon="megaphone" title="No announcements" text="Announcements from the municipal government will appear here." />
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`${routes.municipalAnnouncements}#${a.id}`}
                className={`block rounded-2xl border p-4 transition-colors hover:border-dash-primary/40 ${a.priority === "Urgent" ? "border-dash-danger/30 bg-dash-danger-soft/50" : "border-rule/80 bg-panel"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {a.priority !== "Normal" && <StatusBadge status={a.priority} />}
                  <span className="text-[12px] text-ink-secondary">
                    {a.office} · {formatDate(a.publishedAt)}
                  </span>
                </div>
                <h3 className="mt-1.5 flex items-center gap-1.5 font-display text-[15px] font-bold">
                  {a.priority === "Urgent" && <Icon name="alert" className="h-4 w-4 text-dash-danger" />}
                  {a.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-ink-secondary">{a.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
