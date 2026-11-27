import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Checkbox, Input } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { requireRole } from "@/lib/auth/staff";
import { saveOffice } from "@/server/actions/admin";
import { officesForAdmin } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Municipal Offices" };

type Office = Awaited<ReturnType<typeof officesForAdmin>>[number];

function OfficeDialog({ o }: { o?: Office }) {
  return (
    <ActionDialog
      trigger={o ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> Add office</>}
      triggerClassName={o ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={o ? `Edit ${o.name}` : "Add a municipal office"}
      action={saveOffice}
      hidden={o ? { id: o.id } : undefined}
      confirmLabel="Save"
      icon="sitemap"
    >
      <Input name="name" label="Office name" defaultValue={o?.name} placeholder="Municipal Health Office" required />
      <Input name="acronym" label="Short name" defaultValue={o?.acronym ?? ""} placeholder="MHO" />
      {o && <Checkbox name="isActive" label="Active" hint="Inactive offices cannot receive reports or new staff." defaultChecked={o.isActive} />}
    </ActionDialog>
  );
}

async function Content() {
  const u = await requireRole("MUNICIPAL_ADMIN");
  const rows = await officesForAdmin(u);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" icon="sitemap" title="Municipal Offices" description="Offices that review barangay reports and post announcements. Municipal personnel belong to one office.">
        <OfficeDialog />
      </PageHeader>
      <Card title={`${rows.length} offices`} icon="sitemap">
        <Table
          caption="Offices"
          rows={rows}
          rowKey={(o) => o.id}
          cols={[
            { key: "n", header: "Office", cell: (o) => <Cell2 title={o.name} sub={o.acronym ?? undefined} /> },
            { key: "u", header: "Staff", cell: (o) => <span className="tabular-nums">{o._count.users}</span> },
            { key: "r", header: "Active requirements", cell: (o) => <span className="tabular-nums">{o._count.requirements}</span>, optional: true },
            { key: "s", header: "Status", cell: (o) => <StatusBadge status={o.isActive ? "Active" : "Inactive"} /> },
            { key: "e", header: "", className: "text-right", cell: (o) => <OfficeDialog o={o} /> },
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
