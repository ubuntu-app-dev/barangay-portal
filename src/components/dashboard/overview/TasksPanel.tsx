import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Task } from "@/types/dashboard";

export default function TasksPanel({ items }: { items: Task[] }) {
  return (
    <Card title="Pending Tasks and Reminders" actionLabel="View pending" actionHref={routes.pendingSubmissions}>
      {items.length === 0 ? (
        <EmptyState icon="clipboard" title="You are all caught up" text="Tasks, deadlines, and municipal requirements will show up here." />
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((t) => (
            <li key={t.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{t.title}</p>
                <p className="text-[13px] text-ink-secondary">{t.category}</p>
                <p className={`mt-1 text-[13px] ${t.status === "Overdue" ? "font-semibold text-flag-red" : "text-ink-secondary"}`}>Due {formatDate(t.due)}</p>
              </div>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
