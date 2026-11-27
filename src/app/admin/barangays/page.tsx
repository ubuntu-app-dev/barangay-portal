import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Input } from "@/components/dashboard/ui/form";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { formatNumber } from "@/lib/dashboard/format";
import { deactivateBarangay, onboardBarangay } from "@/server/actions/admin";
import { barangaysForAdmin } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Barangay Onboarding" };

async function Content() {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const rows = await barangaysForAdmin(u);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        icon="building"
        title="Barangay Onboarding"
        description="Activate a barangay to give it puroks, the default document types and fees, and its councils. Then create its secretary's account. Barangays come from the official PSGC list."
      />
      <Card title={`${rows.filter((r) => r.isActive).length} of ${rows.length} barangays onboarded`} icon="building">
        <Table
          caption="Barangays"
          rows={rows}
          rowKey={(b) => b.code}
          cols={[
            { key: "n", header: "Barangay", cell: (b) => <Cell2 title={`Barangay ${b.name}`} sub={`PSGC ${b.code}`} /> },
            { key: "s", header: "Status", cell: (b) => <StatusBadge status={b.isActive ? "Active" : "Inactive"} /> },
            { key: "setup", header: "Setup", cell: (b) => <span className="text-[13px] text-ink-secondary">{b._count.puroks} puroks · {b._count.documentTypes} document types</span>, optional: true },
            { key: "r", header: "Residents", cell: (b) => <span className="tabular-nums">{formatNumber(b.residents)}</span>, optional: true },
            {
              key: "sec",
              header: "Secretary",
              cell: (b) =>
                b.secretaries ? (
                  <Link href={`/admin/users?barangay=${b.code}`} className="font-medium text-dash-primary hover:underline">
                    {b.secretaries} account{b.secretaries === 1 ? "" : "s"}
                  </Link>
                ) : b.isActive ? (
                  <Link href="/admin/users/new" className="font-semibold text-dash-gold-ink hover:underline">
                    Create account
                  </Link>
                ) : (
                  <span className="text-ink-secondary">—</span>
                ),
            },
            {
              key: "a",
              header: "",
              className: "text-right",
              cell: (b) =>
                b.isActive ? (
                  <ActionDialog trigger="Deactivate" triggerClassName="btn btn-ghost btn-sm text-dash-danger" title={`Deactivate Barangay ${b.name}?`} description="Its secretaries are signed out and cannot sign in. Records are kept and come back if you reactivate." action={deactivateBarangay} hidden={{ code: b.code }} confirmLabel="Deactivate" tone="danger" icon="lock" reason={{ label: "Reason", required: true }} />
                ) : (
                  <ActionDialog trigger="Onboard" triggerClassName="btn btn-primary btn-sm" title={`Onboard Barangay ${b.name}?`} description="Adds puroks, default document types (with fees the barangay can change), and councils if it has none yet." action={onboardBarangay} hidden={{ code: b.code }} confirmLabel="Activate" icon="building">
                    <Input name="purokCount" label="Number of puroks or zones" type="number" min={1} max={40} defaultValue={b._count.puroks || 6} required hint={b._count.puroks ? "It already has puroks; they are kept." : "Named Purok 1, Purok 2…; the secretary can rename them."} />
                  </ActionDialog>
                ),
            },
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
