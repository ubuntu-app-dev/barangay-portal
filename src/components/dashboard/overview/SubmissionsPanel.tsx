import Card from "@/components/dashboard/ui/Card";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { formatDate } from "@/lib/dashboard/format";
import type { Submission } from "@/types/dashboard";

export default function SubmissionsPanel({ rows }: { rows: Submission[] }) {
  return (
    <Card title="Municipal Submissions" icon="send" actionLabel="Submission history" actionHref={routes.submissionHistory}>
      <Table
        caption="Recent municipal submissions"
        rows={rows}
        rowKey={(r) => r.id}
        empty={{ icon: "send", title: "No submissions yet", text: "Reports you send to the municipality will be tracked here." }}
        cols={[
          { key: "report", header: "Report", cell: (r) => <span className="font-semibold">{r.report}</span> },
          { key: "office", header: "Office", cell: (r) => <span className="text-ink-secondary">{r.office}</span>, optional: true },
          { key: "date", header: "Submitted", cell: (r) => <span className="whitespace-nowrap">{r.submittedAt ? formatDate(r.submittedAt) : "Not yet"}</span> },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { key: "remarks", header: "Remarks", cell: (r) => <span className="text-[13px] text-ink-secondary">{r.remarks || "—"}</span>, optional: true },
        ]}
      />
    </Card>
  );
}
