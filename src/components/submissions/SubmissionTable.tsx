import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { formatDate } from "@/lib/dashboard/format";
import { REPORT_KIND, SUBMISSION_STATUS, label } from "@/lib/labels";

export const SUBMISSION_BASE = "/dashboard/municipal-submissions/submission-history";

type Row = { id: string; title: string; kind: string; status: string; version: number; submittedAt: Date | null; reviewedAt: Date | null; remarks: string | null; office: { name: string } };

export default function SubmissionTable({ rows }: { rows: Row[] }) {
  return (
    <Table
      caption="Submissions"
      rows={rows}
      rowKey={(r) => r.id}
      empty={{ icon: "send", title: "No submissions", text: "Reports you send to the municipality are listed here." }}
      cols={[
        { key: "title", header: "Report", cell: (r) => <Cell2 title={r.title} sub={`${label(REPORT_KIND, r.kind)}${r.version > 1 ? ` · version ${r.version}` : ""}`} href={`${SUBMISSION_BASE}/${r.id}`} /> },
        { key: "office", header: "Office", cell: (r) => <span className="text-ink-secondary">{r.office.name}</span>, optional: true },
        { key: "date", header: "Submitted", cell: (r) => <Cell2 title={r.submittedAt ? formatDate(r.submittedAt.toISOString()) : "Not yet"} sub={r.reviewedAt ? `Reviewed ${formatDate(r.reviewedAt.toISOString())}` : undefined} /> },
        {
          key: "status",
          header: "Status",
          cell: (r) => (
            <div>
              <StatusBadge status={label(SUBMISSION_STATUS, r.status)} />
              {r.remarks && <p className="mt-1 max-w-[260px] text-[12px] text-ink-secondary">{r.remarks}</p>}
            </div>
          ),
        },
        { key: "go", header: "", className: "text-right", cell: (r) => <RowLink href={`${SUBMISSION_BASE}/${r.id}`} /> },
      ]}
    />
  );
}
