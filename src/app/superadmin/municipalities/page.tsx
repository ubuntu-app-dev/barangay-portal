import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Municipalities" };

async function Content() {
  await requireRole("SUPERADMIN");
  const [muns, active] = await Promise.all([
    db.municipality.findMany({ include: { province: true, region: true, _count: { select: { barangays: true, users: { where: { role: "MUNICIPAL_ADMIN", status: "ACTIVE" } } } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    db.barangay.groupBy({ by: ["municipalityCode"], where: { isActive: true }, _count: true }),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="System" icon="globe" title="Municipalities" description="Cities and municipalities loaded from the official PSGC list. Each needs an IT administrator, who then onboards its barangays.">
        <Link href="/superadmin/municipalities/new" className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" /> Onboard a municipality
        </Link>
      </PageHeader>
      <Card title={`${muns.length} loaded`} icon="globe">
        <Table
          caption="Municipalities"
          rows={muns}
          rowKey={(m) => m.code}
          cols={[
            { key: "n", header: "City or municipality", cell: (m) => <Cell2 title={m.name} sub={`${m.province?.name ?? "No province"} · ${m.region.name}`} href={`/superadmin/municipalities/${m.code}`} /> },
            { key: "c", header: "PSGC", cell: (m) => <span className="tabular-nums text-ink-secondary">{m.code}</span>, optional: true },
            { key: "b", header: "Barangays onboarded", cell: (m) => <span className="tabular-nums">{active.find((x) => x.municipalityCode === m.code)?._count ?? 0} of {m._count.barangays}</span> },
            { key: "a", header: "IT admins", cell: (m) => (m._count.users ? m._count.users : <span className="font-semibold text-dash-gold-ink">None yet</span>) },
            { key: "s", header: "Status", cell: (m) => <StatusBadge status={m.isActive ? "Active" : "Inactive"} /> },
            { key: "g", header: "", className: "text-right", cell: (m) => <RowLink href={`/superadmin/municipalities/${m.code}`} label="Open" /> },
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
