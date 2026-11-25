import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Announcement } from "@/types/dashboard";

export default function AnnouncementsPanel({
  items,
}: {
  items: Announcement[];
}) {
  return (
    <Card
      title="Municipal Announcements"
      actionLabel="View all"
      actionHref={routes.municipalAnnouncements}
    >
      {items.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="No announcements"
          text="Announcements from the Municipal Government will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className={`rounded-lg border p-4 ${a.priority === "Urgent" ? "border-flag-red/40 bg-flag-red/5" : "border-rule"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {a.priority === "Urgent" && (
                  <Icon name="alert" className="h-4 w-4 text-flag-red" />
                )}
                <StatusBadge status={a.priority} />
                <span className="text-[12px] text-ink-secondary">
                  {a.office} &middot; {formatDate(a.publishedAt)}
                </span>
              </div>
              <h3 className="mt-2 font-display text-[15px] font-bold">
                {a.title}
              </h3>
              <p className="mt-1 text-[14px] text-ink-secondary">{a.summary}</p>
              <Link
                href={routes.municipalAnnouncements}
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-dash-primary hover:underline"
              >
                View Details
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
