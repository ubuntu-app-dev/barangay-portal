import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { formatDate, formatDateTime, formatPercent } from "@/lib/dashboard/format";
import { SUBMISSION_STATUS, label } from "@/lib/labels";
import { str, type SearchParams } from "@/server/params";
import { complianceFor, requirementProgress } from "@/server/queries/municipal";

export const metadata: Metadata = { title: "Submission Compliance" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const sp = await searchParams;
  const reqs = await requirementProgress(u);
  const selected = str(sp.requirement) ?? reqs[0]?.id;
  const detail = selected ? await complianceFor(u, selected) : null;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Barangay Reporting" icon="checkCircle" title="Submission Compliance" description="Which barangays have submitted each requirement, and who is late." />
      {reqs.length === 0 ? (
        <Card title="Nothing to track">
          <EmptyState icon="clipboard" title="No active requirements" text="Create a requirement to start tracking submissions." />
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Card title="Requirements" icon="clipboard" bodyClassName="p-2">
            <ul>
              {reqs.map((r) => (
                <li key={r.id}>
                  <Link href={`/municipal/compliance?requirement=${r.id}`} scroll={false} aria-current={r.id === selected ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 ${r.id === selected ? "bg-dash-primary-soft" : "hover:bg-ground-muted/70"}`}>
                    <span className="block text-[14px] font-semibold">{r.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-[12px] text-ink-secondary">
                      <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-ground-muted">
                        <span className={`block h-full ${r.done >= r.expected ? "bg-dash-success" : r.dueAt < new Date() ? "bg-dash-danger" : "bg-dash-primary"}`} style={{ width: formatPercent(r.done, r.expected) }} />
                      </span>
                      {r.done}/{r.expected}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          {detail && (
            <Card title={detail.requirement.title} icon="building" description={`${detail.requirement.office.name} · covers ${formatDate(detail.requirement.periodStart.toISOString())} to ${formatDate(detail.requirement.periodEnd.toISOString())} · due ${formatDateTime(detail.requirement.dueAt.toISOString())}`}>
              <Table
                caption="Barangays"
                rows={detail.rows}
                rowKey={(r) => r.barangay.code}
                cols={[
                  { key: "b", header: "Barangay", cell: (r) => <span className="font-semibold">Barangay {r.barangay.name}</span> },
                  { key: "s", header: "Status", cell: (r) => <StatusBadge status={r.latest ? label(SUBMISSION_STATUS, r.latest.status) : r.late ? "Overdue" : "Not Submitted"} /> },
                  { key: "d", header: "Submitted", cell: (r) => <Cell2 title={r.latest?.submittedAt ? formatDateTime(r.latest.submittedAt.toISOString()) : "—"} sub={r.latest && r.late ? <span className="text-dash-danger">Late</span> : r.latest && r.latest.version > 1 ? `Version ${r.latest.version}` : undefined} /> },
                  {
                    key: "go",
                    header: "",
                    className: "text-right",
                    cell: (r) =>
                      r.latest ? (
                        <Link href={`/municipal/submissions/${r.latest.id}`} className="btn btn-ghost btn-sm text-dash-primary">
                          Open
                        </Link>
                      ) : null,
                  },
                ]}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
