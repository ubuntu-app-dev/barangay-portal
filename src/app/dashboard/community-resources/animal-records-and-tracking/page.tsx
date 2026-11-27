import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimalDialog } from "@/components/community/Dialogs";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Input } from "@/components/dashboard/ui/form";
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
import { daysAgoDate, exportHref, formatDate, formatNumber, isoDay } from "@/lib/dashboard/format";
import { ANIMAL_STATUS, SEX, SPECIES, label, options } from "@/lib/labels";
import { deleteAnimal, recordVaccination } from "@/server/actions/community";
import { flat, type SearchParams } from "@/server/params";
import { listAnimals } from "@/server/queries/community";

export const metadata: Metadata = { title: "Animal Records and Tracking" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const d = await listAnimals(session, sp);
  const count = (s: string) => d.bySpecies.find((x) => x.species === s)?._count ?? 0;
  const total = d.bySpecies.reduce((s, x) => s + x._count, 0);
  const yearAgo = daysAgoDate(365).getTime();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Community Resources" icon="paw" title="Animal Records and Tracking" description="Pets and livestock in the barangay, with anti-rabies vaccination tracking for dogs and cats.">
        <a href={exportHref("animals")} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
        <AnimalDialog />
      </PageHeader>
      <StatTiles
        tiles={[
          { icon: "paw", label: "Registered animals", value: formatNumber(total), tone: "primary" },
          { icon: "heart", label: "Dogs and cats", value: formatNumber(count("DOG") + count("CAT")), tone: "secondary" },
          { icon: "leaf", label: "Livestock", value: formatNumber(total - count("DOG") - count("CAT")), tone: "success" },
          { icon: "alert", label: "Vaccination due", value: formatNumber(d.due), hint: "Dogs and cats, none in the last 12 months", tone: d.due ? "danger" : "success", href: `${routes.animals}?vax=due` },
        ]}
      />
      <Card title={`${formatNumber(d.total)} animal${d.total === 1 ? "" : "s"}`} icon="paw">
        <ListToolbar
          placeholder="Search tag, name, breed, or owner"
          filters={[
            { name: "species", label: "Species", options: options(SPECIES) },
            { name: "vax", label: "Vaccination", options: [{ value: "due", label: "Due or never" }, { value: "ok", label: "Up to date" }] },
            { name: "status", label: "Status", options: options(ANIMAL_STATUS).filter((o) => o.value !== "ACTIVE") },
          ]}
        />
        <Table
          caption="Animals"
          rows={d.rows}
          rowKey={(a) => a.id}
          empty={{ icon: "paw", title: "No animals found", text: "Register pets and livestock to track them here." }}
          cols={[
            { key: "tag", header: "Animal", cell: (a) => <Cell2 title={`${a.tagNo}${a.name ? ` · ${a.name}` : ""}`} sub={[label(SPECIES, a.species), a.breed, a.sex ? label(SEX, a.sex) : null, a.color].filter(Boolean).join(" · ")} /> },
            { key: "owner", header: "Owner", cell: (a) => <Cell2 title={a.ownerName} sub={a.owner?.residentNo ?? "Not a resident"} href={a.owner ? `${routes.residents}/${a.owner.id}` : undefined} /> },
            {
              key: "vax",
              header: "Vaccination",
              cell: (a) => {
                const due = !a.lastVaccinatedAt || a.lastVaccinatedAt.getTime() < yearAgo;
                return a.lastVaccinatedAt ? (
                  <Cell2 title={<span className={due ? "text-dash-danger" : ""}>{formatDate(a.lastVaccinatedAt.toISOString())}</span>} sub={`${a.vaccine ?? "Vaccine"}${due ? " · due again" : ""}`} />
                ) : (
                  <span className="text-[13px] text-ink-secondary">Never recorded</span>
                );
              },
            },
            { key: "status", header: "Status", cell: (a) => <StatusBadge status={label(ANIMAL_STATUS, a.status)} />, optional: true },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (a) => (
                <div className="flex justify-end gap-1">
                  <ActionDialog trigger="Vaccinated" triggerClassName="btn btn-soft btn-sm" title={`Record vaccination for ${a.tagNo}`} action={recordVaccination} hidden={{ id: a.id }} confirmLabel="Save" icon="checkCircle">
                    <Input name="lastVaccinatedAt" label="Date" type="date" defaultValue={isoDay(new Date())} required />
                    <Input name="vaccine" label="Vaccine" defaultValue={a.vaccine ?? "Anti-rabies"} required />
                  </ActionDialog>
                  <AnimalDialog animal={a} />
                  <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger" title={`Remove ${a.tagNo}?`} description="For records entered by mistake. For animals that died or moved, edit the status instead." action={deleteAnimal} hidden={{ id: a.id }} confirmLabel="Remove" tone="danger" icon="trash" />
                </div>
              ),
            },
          ]}
        />
        <Pagination page={d.page} pageSize={d.pageSize} total={d.total} params={flat(sp)} basePath={routes.animals} />
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
