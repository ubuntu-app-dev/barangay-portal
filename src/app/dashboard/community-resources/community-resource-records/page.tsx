import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourceDialog } from "@/components/community/Dialogs";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { exportHref, formatMoney, formatNumber } from "@/lib/dashboard/format";
import { CONDITION, RESOURCE_CATEGORY, label, options } from "@/lib/labels";
import { deleteResource } from "@/server/actions/community";
import { flat, type SearchParams } from "@/server/params";
import { listResources } from "@/server/queries/community";

export const metadata: Metadata = { title: "Community Resource Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const d = await listResources(session, sp);
  const total = d.byCategory.reduce((s, x) => s + x._count, 0);
  const cond = (c: string) => d.byCondition.find((x) => x.condition === c)?._count ?? 0;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Community Resources" icon="box" title="Community Resource Records" description="Facilities, equipment, vehicles, water systems, and evacuation centers the barangay owns or manages.">
        <a href={exportHref("resources")} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
        <ResourceDialog />
      </PageHeader>
      <StatTiles
        tiles={[
          { icon: "box", label: "Items in the inventory", value: formatNumber(total), tone: "primary" },
          { icon: "checkCircle", label: "In good condition", value: formatNumber(cond("GOOD")), tone: "success" },
          { icon: "alert", label: "Poor or unserviceable", value: formatNumber(cond("POOR") + cond("UNSERVICEABLE")), tone: cond("POOR") + cond("UNSERVICEABLE") ? "gold" : "success", href: `${routes.resources}?condition=POOR` },
          { icon: "clipboard", label: "Recorded value", value: d.totalValue ? formatMoney(d.totalValue) : "Not set", tone: "secondary" },
        ]}
      />
      <Card title={`${formatNumber(d.total)} item${d.total === 1 ? "" : "s"}`} icon="box">
        <ListToolbar
          placeholder="Search name, location, or custodian"
          filters={[
            { name: "category", label: "Category", options: options(RESOURCE_CATEGORY) },
            { name: "condition", label: "Condition", options: options(CONDITION) },
          ]}
        />
        <Table
          caption="Community resources"
          rows={d.rows}
          rowKey={(r) => r.id}
          empty={{ icon: "box", title: "No resources found", text: "Add the barangay's facilities and equipment to keep the inventory current." }}
          cols={[
            { key: "name", header: "Resource", cell: (r) => <Cell2 title={r.name} sub={label(RESOURCE_CATEGORY, r.category)} /> },
            { key: "qty", header: "Quantity", cell: (r) => <span className="tabular-nums">{formatNumber(r.quantity)} {r.unit}</span> },
            { key: "loc", header: "Location / custodian", cell: (r) => <Cell2 title={r.location ?? "—"} sub={r.custodian ?? undefined} />, optional: true },
            { key: "cond", header: "Condition", cell: (r) => <StatusBadge status={label(CONDITION, r.condition)} /> },
            { key: "value", header: "Value", cell: (r) => (r.value ? formatMoney(r.value) : "—"), optional: true },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) => (
                <div className="flex justify-end gap-1">
                  <ResourceDialog resource={r} />
                  <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger" title={`Remove ${r.name}?`} action={deleteResource} hidden={{ id: r.id }} confirmLabel="Remove" tone="danger" icon="trash" reason={{ label: "Reason", placeholder: "Disposed, donated, lost, transferred…", required: true }} />
                </div>
              ),
            },
          ]}
        />
        <Pagination page={d.page} pageSize={d.pageSize} total={d.total} params={flat(sp)} basePath={routes.resources} />
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
