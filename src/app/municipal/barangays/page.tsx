import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { formatNumber } from "@/lib/dashboard/format";
import { barangayDirectory } from "@/server/queries/municipal";

export const metadata: Metadata = { title: "Barangays" };

async function Content() {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const rows = await barangayDirectory(u);
  const active = rows.filter((r) => r.isActive);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipality" icon="building" title="Barangays" description="Every barangay of the municipality, with its record counts and contact. Only onboarded barangays submit through LGU Connect." />
      <StatTiles
        columns={3}
        tiles={[
          { icon: "building", label: "On LGU Connect", value: `${active.length} of ${rows.length}`, tone: "primary" },
          { icon: "users", label: "Residents on record", value: formatNumber(active.reduce((s, r) => s + r.population, 0)), tone: "secondary" },
          { icon: "alert", label: "Barangays with overdue reports", value: formatNumber(active.filter((r) => r.overdue > 0).length), tone: active.some((r) => r.overdue) ? "danger" : "success", href: "/municipal/compliance" },
        ]}
      />
      <Card title={`${rows.length} barangays`} icon="building">
        <Table
          caption="Barangays"
          rows={rows}
          rowKey={(r) => r.code}
          cols={[
            { key: "n", header: "Barangay", cell: (r) => <Cell2 title={`Barangay ${r.name}`} sub={`PSGC ${r.code} · ${r.classification === "URBAN" ? "Urban" : "Rural"}`} /> },
            { key: "s", header: "Status", cell: (r) => <StatusBadge status={r.isActive ? "Active" : "Inactive"} /> },
            { key: "p", header: "Residents / households", cell: (r) => (r.isActive ? <span className="tabular-nums">{formatNumber(r.population)} / {formatNumber(r.households)}</span> : <span className="text-ink-secondary">—</span>) },
            { key: "sec", header: "Secretary", cell: (r) => (r.secretary ? <Cell2 title={`${r.secretary.firstName} ${r.secretary.lastName}`} sub={r.secretary.phone ?? r.secretary.email ?? undefined} /> : <span className="text-ink-secondary">No account</span>), optional: true },
            { key: "o", header: "Overdue reports", cell: (r) => (r.overdue ? <span className="font-semibold text-dash-danger">{r.overdue}</span> : <span className="text-ink-secondary">0</span>) },
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
