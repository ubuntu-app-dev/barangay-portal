"use client";
import Card from "@/components/dashboard/ui/Card";
import DataTable, { type Column } from "@/components/dashboard/ui/DataTable";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Submission } from "@/types/dashboard";

const columns: Column<Submission>[] = [
  { key: "report", header: "Report Name", cell: (r) => <span className="font-semibold">{r.report}</span>, sortValue: (r) => r.report },
  { key: "date", header: "Submission Date", cell: (r) => <span className="whitespace-nowrap">{formatDate(r.submittedAt)}</span>, sortValue: (r) => r.submittedAt },
  { key: "office", header: "Reviewing Office", cell: (r) => r.office, sortValue: (r) => r.office },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  { key: "remarks", header: "Remarks", cell: (r) => <span className="text-ink-secondary">{r.remarks}</span> },
];

export default function SubmissionsPanel({ rows }: { rows: Submission[] }) {
  return (
    <Card title="Municipal Submission Overview" actionLabel="Submission History" actionHref={routes.submissionHistory}>
      <DataTable
        caption="Recent municipal submissions"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.report} ${r.office} ${r.remarks}`}
        filter={{ label: "Status", options: ["Received", "Under Review", "Approved", "Returned for Revision"], pick: (r) => r.status }}
        initialSort={{ key: "date", dir: "desc" }}
        emptyTitle="No submissions yet"
        emptyText="Reports you send to the municipality will be tracked here."
      />
    </Card>
  );
}
