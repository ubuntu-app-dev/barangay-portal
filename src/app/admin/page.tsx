import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import { requireRole } from "@/lib/auth/staff";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { adminOverview } from "@/server/queries/admin";

async function Content() {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const d = await adminOverview(u);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${u.municipality!.name}, ${u.municipality!.province}`} icon="key" title={`Good day, ${u.firstName}`} description="Accounts, barangay onboarding, and security for your municipality.">
        <Link href="/admin/users/new" className="btn btn-primary">
          <Icon name="userPlus" className="h-4 w-4" /> New account
        </Link>
      </PageHeader>
      <StatTiles
        columns={5}
        tiles={[
          { icon: "users", label: "Active accounts", value: formatNumber(d.active), tone: "primary", href: "/admin/users" },
          { icon: "lock", label: "Locked out now", value: formatNumber(d.locked), tone: d.locked ? "danger" : "success", href: "/admin/users?locked=1" },
          { icon: "key", label: "Still on a temporary password", value: formatNumber(d.temp), tone: d.temp ? "gold" : "success" },
          { icon: "building", label: "Barangays onboarded", value: `${d.barangaysActive} of ${d.barangaysTotal}`, tone: "secondary", href: "/admin/barangays" },
          { icon: "alert", label: "Failed sign-ins (7 days)", value: formatNumber(d.failed), tone: d.failed > 10 ? "danger" : "secondary", href: "/admin/audit?action=LOGIN_FAILED" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Onboarded barangays without a secretary" icon="building" actionLabel="Barangays" actionHref="/admin/barangays">
          {d.noAccount.length === 0 ? (
            <EmptyState icon="checkCircle" title="Every onboarded barangay has an account" text="New barangays you onboard will show here until their secretary has an account." />
          ) : (
            <ul className="divide-y divide-rule/70">
              {d.noAccount.map((b) => (
                <li key={b.code} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="font-semibold">Barangay {b.name}</span>
                  <Link href="/admin/users/new" className="btn btn-soft btn-sm">
                    Create account
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent failed sign-ins" icon="alert" actionLabel="Audit log" actionHref="/admin/audit?action=LOGIN_FAILED">
          {d.recentFailed.length === 0 ? (
            <EmptyState icon="checkCircle" title="No failed sign-ins" text="Wrong passwords and wrong-location attempts are listed here." />
          ) : (
            <ul className="divide-y divide-rule/70">
              {d.recentFailed.map((f) => (
                <li key={f.id} className="py-2.5 text-[14px]">
                  <p className="font-semibold">{f.actorName}</p>
                  <p className="text-[12.5px] text-ink-secondary">
                    {f.summary} · {formatDateTime(f.createdAt.toISOString())}
                    {f.ip ? ` · ${f.ip}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
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
