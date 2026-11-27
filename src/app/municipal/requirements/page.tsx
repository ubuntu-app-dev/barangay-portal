import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import RequirementDialog from "@/components/municipal/RequirementDialog";
import { requireRole } from "@/lib/auth/staff";
import { formatDateTime } from "@/lib/dashboard/format";
import { FREQUENCY, REPORT_KIND, label } from "@/lib/labels";
import { db } from "@/server/db";
import { requirementProgress } from "@/server/queries/municipal";

export const metadata: Metadata = { title: "Report Requirements" };

async function Content() {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const [reqs, offices] = await Promise.all([requirementProgress(u, true), db.municipalOffice.findMany({ where: { municipalityCode: u.municipality!.code, isActive: true }, orderBy: { name: "asc" } })]);
  const now = new Date();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Barangay Reporting" icon="clipboard" title="Report Requirements" description="What every barangay must submit, for which period, and by when. Barangays generate the figures from their records.">
        <RequirementDialog offices={offices} defaultOffice={u.office?.id} />
      </PageHeader>
      <Card title={`${reqs.filter((r) => r.isActive).length} active requirement${reqs.length === 1 ? "" : "s"}`} icon="clipboard">
        <Table
          caption="Requirements"
          rows={reqs}
          rowKey={(r) => r.id}
          empty={{ icon: "clipboard", title: "No requirements yet", text: "Create one to ask every barangay for a report." }}
          cols={[
            { key: "title", header: "Requirement", cell: (r) => <Cell2 title={r.title} sub={`${label(REPORT_KIND, r.kind)} · ${label(FREQUENCY, r.frequency)} · ${r.office.name}`} href={`/municipal/compliance?requirement=${r.id}`} /> },
            { key: "due", header: "Due", cell: (r) => <span className={r.isActive && r.dueAt < now && r.done < r.expected ? "font-semibold text-dash-danger" : ""}>{formatDateTime(r.dueAt.toISOString())}</span> },
            {
              key: "progress",
              header: "Submitted",
              cell: (r) => (
                <Link href={`/municipal/compliance?requirement=${r.id}`} className="block min-w-[130px] hover:text-dash-primary">
                  <span className="text-[13px] font-semibold tabular-nums">
                    {r.done}/{r.expected} barangays
                  </span>
                  <span aria-hidden="true" className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ground-muted">
                    <span className="block h-full rounded-full bg-dash-primary" style={{ width: `${r.expected ? (r.done / r.expected) * 100 : 0}%` }} />
                  </span>
                </Link>
              ),
            },
            { key: "status", header: "Status", cell: (r) => <StatusBadge status={!r.isActive ? "Inactive" : r.done >= r.expected ? "Completed" : r.dueAt < now ? "Overdue" : "Open"} /> },
            { key: "edit", header: "", className: "text-right", cell: (r) => <RequirementDialog req={r} offices={offices} /> },
          ]}
        />
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
