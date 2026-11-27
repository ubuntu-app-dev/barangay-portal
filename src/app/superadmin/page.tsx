import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { requireRole } from "@/lib/auth/staff";
import { daysAgoDate, formatNumber } from "@/lib/dashboard/format";
import { db } from "@/server/db";
import { ROLE_LABEL } from "@/server/queries/users";

async function Content() {
  const u = await requireRole("SUPERADMIN");
  const day = daysAgoDate(1);
  const [muns, barangays, roles, sessions, failed, size, residents] = await Promise.all([
    db.municipality.findMany({ include: { province: true, _count: { select: { barangays: true, users: { where: { role: "MUNICIPAL_ADMIN", status: "ACTIVE" } } } } }, orderBy: { name: "asc" } }),
    db.barangay.groupBy({ by: ["isActive"], _count: true }),
    db.user.groupBy({ by: ["role"], where: { status: "ACTIVE" }, _count: true }),
    db.session.count({ where: { expiresAt: { gt: new Date() } } }),
    db.auditLog.count({ where: { action: "LOGIN_FAILED", createdAt: { gte: day } } }),
    db.$queryRaw<{ size: string }[]>`SELECT pg_size_pretty(pg_database_size(current_database())) AS size`,
    db.resident.count({ where: { deletedAt: null } }),
  ]);
  const activeBrgy = barangays.find((b) => b.isActive)?._count ?? 0;
  const brgyActive = await db.barangay.groupBy({ by: ["municipalityCode"], where: { isActive: true }, _count: true });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="LGU Connect" icon="globe" title={`Good day, ${u.firstName}`} description="Every municipality on the platform, their administrators, and system health.">
        <Link href="/superadmin/municipalities/new" className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" /> Onboard a municipality
        </Link>
      </PageHeader>
      <StatTiles
        columns={5}
        tiles={[
          { icon: "globe", label: "Municipalities active", value: `${muns.filter((m) => m.isActive).length} of ${muns.length}`, tone: "primary", href: "/superadmin/municipalities" },
          { icon: "building", label: "Barangays onboarded", value: formatNumber(activeBrgy), tone: "secondary" },
          { icon: "users", label: "Residents on record", value: formatNumber(residents), tone: "success" },
          { icon: "key", label: "Signed-in sessions", value: formatNumber(sessions), hint: `Database ${size[0]?.size ?? "?"}`, tone: "secondary" },
          { icon: "alert", label: "Failed sign-ins (24 h)", value: formatNumber(failed), tone: failed > 20 ? "danger" : "secondary", href: "/superadmin/audit?action=LOGIN_FAILED" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card title="Municipalities" icon="globe" actionLabel="Manage" actionHref="/superadmin/municipalities">
          <Table
            caption="Municipalities"
            rows={muns}
            rowKey={(m) => m.code}
            empty={{ icon: "globe", title: "No municipalities yet", text: "Onboard one from the official PSGC list." }}
            cols={[
              { key: "n", header: "Municipality", cell: (m) => <Cell2 title={m.name} sub={m.province?.name ?? "No province"} href={`/superadmin/municipalities/${m.code}`} /> },
              { key: "b", header: "Barangays onboarded", cell: (m) => <span className="tabular-nums">{brgyActive.find((x) => x.municipalityCode === m.code)?._count ?? 0} of {m._count.barangays}</span> },
              { key: "a", header: "IT admins", cell: (m) => (m._count.users ? m._count.users : <span className="font-semibold text-dash-gold-ink">None</span>) },
              { key: "s", header: "Status", cell: (m) => <StatusBadge status={m.isActive ? "Active" : "Inactive"} /> },
            ]}
          />
        </Card>
        <Card title="Active accounts" icon="users">
          <ul className="divide-y divide-rule/70">
            {(["SUPERADMIN", "MUNICIPAL_ADMIN", "MUNICIPAL_PERSONNEL", "BARANGAY_SECRETARY"] as const).map((r) => (
              <li key={r} className="flex justify-between gap-3 py-2.5 text-[14px]">
                <span>{ROLE_LABEL[r]}</span>
                <span className="font-semibold tabular-nums">{formatNumber(roles.find((x) => x.role === r)?._count ?? 0)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Content />
    </Suspense>
  );
}
