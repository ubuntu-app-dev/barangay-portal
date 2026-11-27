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
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { ageOf, formatNumber, nameLastFirst } from "@/lib/dashboard/format";
import { CIVIL_STATUS, RESIDENT_STATUS, SEX, label, options } from "@/lib/labels";
import { flat, str, type SearchParams } from "@/server/params";
import { CLASSES, getPuroks, listResidents } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Resident Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const [{ rows, total, page, pageSize }, puroks] = await Promise.all([listResidents(session, sp), getPuroks(session)]);
  const now = new Date();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Resident Management" icon="users" title="Resident Records" description="Everyone registered in the barangay. Search by name or resident number, or narrow the list with the filters.">
        <a href={`/api/dashboard/export/residents?${new URLSearchParams(flat(sp) as Record<string, string>)}`} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
        <Link href={routes.addResident} className="btn btn-primary">
          <Icon name="userPlus" className="h-4 w-4" /> Register resident
        </Link>
      </PageHeader>
      <SavedNotice value={str(sp.saved)} />
      <Card title={`${formatNumber(total)} resident${total === 1 ? "" : "s"}`} description={str(sp.status) && str(sp.status) !== "ACTIVE" ? label(RESIDENT_STATUS, str(sp.status)) : "Active records"}>
        <ListToolbar
          placeholder="Search name, resident no., or mobile"
          filters={[
            { name: "purok", label: "Purok", options: puroks.map((p) => ({ value: p.id, label: p.name })) },
            { name: "sex", label: "Sex", options: options(SEX) },
            { name: "class", label: "Classification", options: Object.entries(CLASSES).map(([value, c]) => ({ value, label: c.label })) },
            { name: "status", label: "Status", options: options(RESIDENT_STATUS).filter((o) => o.value !== "ACTIVE") },
          ]}
        />
        <Table
          caption="Residents"
          rows={rows}
          rowKey={(r) => r.id}
          empty={{ icon: "users", title: "No residents found", text: "Try a different name, or clear the filters." }}
          cols={[
            {
              key: "name",
              header: "Name",
              cell: (r) => (
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${r.sex === "FEMALE" ? "bg-[#fde8ee] text-[#b4235a]" : "bg-dash-primary-soft text-dash-primary"}`}>
                    {r.firstName[0]}
                    {r.lastName[0]}
                  </span>
                  <Cell2 title={nameLastFirst(r)} sub={r.residentNo} href={`${routes.residents}/${r.id}`} />
                </div>
              ),
            },
            { key: "age", header: "Age / Sex", cell: (r) => <span className="whitespace-nowrap">{ageOf(r.birthDate, now)} · {label(SEX, r.sex)}</span> },
            { key: "civil", header: "Civil status", cell: (r) => label(CIVIL_STATUS, r.civilStatus), optional: true },
            { key: "address", header: "Address", cell: (r) => <Cell2 title={r.purok?.name ?? "No purok"} sub={r.address} />, optional: true },
            {
              key: "household",
              header: "Household",
              cell: (r) =>
                r.household ? (
                  <Link href={`${routes.households}/${r.household.id}`} className="font-medium text-dash-primary hover:underline">
                    {r.household.householdNo}
                  </Link>
                ) : (
                  <span className="text-ink-secondary">None</span>
                ),
              optional: true,
            },
            {
              key: "tags",
              header: "Tags",
              cell: (r) => (
                <div className="flex flex-wrap gap-1">
                  {r.status !== "ACTIVE" && <StatusBadge status={label(RESIDENT_STATUS, r.status)} />}
                  {r.isRegisteredVoter && <span className="rounded-md bg-ground-muted px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">Voter</span>}
                  {ageOf(r.birthDate, now) >= 60 && <span className="rounded-md bg-dash-gold-soft px-1.5 py-0.5 text-[11px] font-semibold text-dash-gold-ink">Senior</span>}
                  {r.isPwd && <span className="rounded-md bg-dash-secondary-soft px-1.5 py-0.5 text-[11px] font-semibold text-dash-secondary">PWD</span>}
                  {r.is4Ps && <span className="rounded-md bg-dash-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-dash-success">4Ps</span>}
                </div>
              ),
              optional: true,
            },
            { key: "go", header: "", cell: (r) => <RowLink href={`${routes.residents}/${r.id}`} />, className: "text-right" },
          ]}
        />
        <Pagination page={page} pageSize={pageSize} total={total} params={flat(sp)} basePath={routes.residents} />
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
