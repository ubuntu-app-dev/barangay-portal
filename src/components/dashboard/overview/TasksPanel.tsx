import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Task } from "@/types/dashboard";

export default function TasksPanel({ items, className = "" }: { items: Task[]; className?: string }) {
  return (
    <Card title="Tasks and Deadlines" icon="clipboard" actionLabel="Pending reports" actionHref={routes.pendingSubmissions} className={className} bodyClassName="p-2">
      {items.length === 0 ? (
        <EmptyState icon="checkCircle" title="You are all caught up" text="Municipal requirements, open requests, and case deadlines will show up here." />
      ) : (
        <ul>
          {items.map((t) => (
            <li key={t.id}>
              <Link href={t.href} className="group flex items-start justify-between gap-3 rounded-xl px-3 py-3 hover:bg-ground-muted/70">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug group-hover:text-dash-primary">{t.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-secondary">
                    {t.category}
                    {t.due && (
                      <>
                        {" · "}
                        <span className={t.status === "Overdue" ? "font-semibold text-dash-danger" : ""}>Due {formatDate(t.due)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={t.status} />
                  <Icon name="chevronRight" className="h-4 w-4 text-ink-secondary" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
