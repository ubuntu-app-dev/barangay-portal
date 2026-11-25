"use client";
import Card from "@/components/dashboard/ui/Card";
import DataTable, { type Column } from "@/components/dashboard/ui/DataTable";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDateTime } from "@/lib/dashboard/format";
import type { Activity } from "@/types/dashboard";

const columns: Column<Activity>[] = [
  { key: "activity", header: "Activity", cell: (r) => <span className="font-semibold">{r.activity}</span>, sortValue: (r) => r.activity },
  { key: "description", header: "Description", cell: (r) => <span className="text-ink-secondary">{r.description}</span> },
  { key: "by", header: "Performed By", cell: (r) => r.performedBy, sortValue: (r) => r.performedBy },
  { key: "at", header: "Date and Time", cell: (r) => <span className="whitespace-nowrap">{formatDateTime(r.at)}</span>, sortValue: (r) => r.at },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
];

export default function RecentActivities({ rows }: { rows: Activity[] }) {
  return (
    <Card title="Recent Activities" actionLabel="View All Activities" actionHref={routes.activities}>
      <DataTable
        caption="Recent activities"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.activity} ${r.description} ${r.performedBy}`}
        filter={{ label: "Status", options: ["Completed", "In Progress", "Pending", "Needs Attention"], pick: (r) => r.status }}
        initialSort={{ key: "at", dir: "desc" }}
        emptyTitle="No activities found"
        emptyText="Nothing matches your search. Try a different word or clear the filter."
      />
    </Card>
  );
}
