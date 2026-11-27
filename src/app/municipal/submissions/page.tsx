import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { formatDate, formatNumber } from "@/lib/dashboard/format";
import { REPORT_KIND, SUBMISSION_STATUS, label, options } from "@/lib/labels";
import { flat, type SearchParams } from "@/server/params";
import { activeBarangays, listInbox } from "@/server/queries/municipal";

export const metadata: Metadata = { title: "Submissions from Barangays" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const sp = await searchParams;
  const [list, barangays] = await Promise.all([listInbox(u, sp), activeBarangays(u)]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Barangay Reporting"
        icon="inbox"
        title="Submissions from Barangays"
        description={`Reports waiting for review${u.office && !list.allOffices ? ` by the ${u.office.name}` : " across all offices"}, oldest first. Change the status filter to see decided ones.`}
      />
      <Card title={`${formatNumber(list.total)} submission${list.total === 1 ? "" : "s"}`} icon="inbox">
        <ListToolbar
          placeholder="Search report or barangay"
          filters={[
            { name: "status", label: "Status", options: options(SUBMISSION_STATUS).filter((o) => o.value !== "DRAFT") },
            { name: "barangay", label: "Barangay", options: barangays.map((b) => ({ value: b.code, label: b.name })) },
            ...(u.office ? [{ name: "office", label: "Office", options: [{ value: "all", label: "All offices" }] }] : []),
          ]}
        />
        <Table
          caption="Submissions"
          rows={list.rows}
          rowKey={(s) => s.id}
          empty={{ icon: "checkCircle", title: "Nothing to review", text: "New submissions from barangays will show up here." }}
          cols={[
            { key: "title", header: "Report", cell: (s) => <Cell2 title={s.title} sub={`${label(REPORT_KIND, s.kind)}${s.version > 1 ? ` · version ${s.version}` : ""}`} href={`/municipal/submissions/${s.id}`} /> },
            { key: "brgy", header: "Barangay", cell: (s) => `Barangay ${s.barangay.name}` },
            { key: "office", header: "Office", cell: (s) => <span className="text-ink-secondary">{s.office.acronym ?? s.office.name}</span>, optional: true },
            {
              key: "date",
              header: "Submitted",
              cell: (s) => {
                const late = s.submittedAt && s.requirement && s.submittedAt > s.requirement.dueAt;
                return <Cell2 title={s.submittedAt ? formatDate(s.submittedAt.toISOString()) : "—"} sub={late ? <span className="font-semibold text-dash-danger">After the due date</span> : undefined} />;
              },
            },
            { key: "status", header: "Status", cell: (s) => <StatusBadge status={label(SUBMISSION_STATUS, s.status)} /> },
            { key: "go", header: "", className: "text-right", cell: (s) => <RowLink href={`/municipal/submissions/${s.id}`} label="Review" /> },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath="/municipal/submissions" />
      </Card>
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
