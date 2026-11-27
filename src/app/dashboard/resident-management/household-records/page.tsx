import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatNumber } from "@/lib/dashboard/format";
import { TENURE, WATER, WATER_SHORT, label, options } from "@/lib/labels";
import { flat, str, type SearchParams } from "@/server/params";
import { getPuroks, listHouseholds } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Household Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const [{ rows, total, page, pageSize }, puroks] = await Promise.all([listHouseholds(session, sp), getPuroks(session)]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Resident Management" icon="home" title="Household Records" description="Every household, its members, and its utilities. Open a household to add or move members.">
        <a href={`/api/dashboard/export/households?${new URLSearchParams(flat(sp) as Record<string, string>)}`} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
        <Link href={routes.newHousehold} className="btn btn-primary">
          <Icon name="homePlus" className="h-4 w-4" /> Add household
        </Link>
      </PageHeader>
      <SavedNotice value={str(sp.saved)} />
      <Card title={`${formatNumber(total)} household${total === 1 ? "" : "s"}`}>
        <ListToolbar
          placeholder="Search household no., street, or family name"
          filters={[
            { name: "purok", label: "Purok", options: puroks.map((p) => ({ value: p.id, label: p.name })) },
            { name: "water", label: "Water", options: options(WATER_SHORT) },
          ]}
        />
        <Table
          caption="Households"
          rows={rows}
          rowKey={(r) => r.id}
          empty={{ icon: "home", title: "No households found", text: "Try a different search, or add a household." }}
          cols={[
            {
              key: "no",
              header: "Household",
              cell: (h) => {
                const head = h.members.find((m) => m.relationship === "HEAD");
                return <Cell2 title={h.householdNo} sub={head ? `Head: ${head.firstName} ${head.lastName}` : "No head recorded"} href={`${routes.households}/${h.id}`} />;
              },
            },
            { key: "address", header: "Address", cell: (h) => <Cell2 title={h.purok?.name ?? "No purok"} sub={h.address} /> },
            {
              key: "members",
              header: "Members",
              cell: (h) => (
                <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                  <Icon name="users" className="h-4 w-4 text-ink-secondary" />
                  {h.members.length}
                  {h._count.families > 1 && <span className="font-normal text-ink-secondary">· {h._count.families} families</span>}
                </span>
              ),
            },
            { key: "water", header: "Water", cell: (h) => <span title={label(WATER, h.waterSource)}>{label(WATER_SHORT, h.waterSource)}</span>, optional: true },
            { key: "tenure", header: "Tenure", cell: (h) => label(TENURE, h.tenure), optional: true },
            { key: "go", header: "", cell: (h) => <RowLink href={`${routes.households}/${h.id}`} />, className: "text-right" },
          ]}
        />
        <Pagination page={page} pageSize={pageSize} total={total} params={flat(sp)} basePath={routes.households} />
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
