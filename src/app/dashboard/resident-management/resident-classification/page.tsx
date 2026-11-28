import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { ageOf, formatNumber, nameLastFirst } from "@/lib/dashboard/format";
import { SEX, label } from "@/lib/labels";
import { flat, oneOf, str, type SearchParams } from "@/server/params";
import { CLASSES, classificationCounts, getPuroks, listResidents, type ClassKey } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Resident Classification" };

const ICONS: Record<ClassKey, IconName> = { voter: "fileCheck", senior: "star", pwd: "heart", solo: "user", "4ps": "home", osy: "info", ofw: "globe", ip: "leaf" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const cls = oneOf(str(sp.class), CLASSES) ?? "senior";
  const [counts, list, puroks] = await Promise.all([classificationCounts(session), listResidents(session, { ...sp, class: cls }), getPuroks(session)]);
  const params = { ...flat(sp), class: cls };
  const now = new Date();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Resident Management" icon="layers" title="Resident Classification" description="Sector lists for programs and reports. Classifications are set on each resident's record; seniors are counted from the birth date.">
        <a href={`/api/dashboard/export/residents?${new URLSearchParams({ ...(params as Record<string, string>) })}`} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export this list
        </a>
      </PageHeader>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(Object.keys(CLASSES) as ClassKey[]).map((k) => {
          const on = k === cls;
          return (
            <li key={k}>
              <Link
                href={`${routes.classification}?class=${k}`}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`surface flex items-center gap-3 p-4 transition hover:border-dash-primary/40 ${on ? "!border-dash-primary bg-dash-primary-soft/60 ring-2 ring-dash-primary/15" : ""}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-brand-fill text-white" : "bg-dash-primary-soft text-dash-primary"}`}>
                  <Icon name={ICONS[k]} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[22px] font-bold leading-none tabular-nums">{formatNumber(counts[k])}</span>
                  <span className="mt-1 block truncate text-[12.5px] font-medium text-ink-secondary">{CLASSES[k].label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Card title={CLASSES[cls].label} description={`${formatNumber(list.total)} active resident${list.total === 1 ? "" : "s"}`}>
        <ListToolbar placeholder="Search name or resident no." filters={[{ name: "purok", label: "Purok", options: puroks.map((p) => ({ value: p.id, label: p.name })) }]} />
        <Table
          caption={CLASSES[cls].label}
          rows={list.rows}
          rowKey={(r) => r.id}
          empty={{ icon: "users", title: "Nobody in this list", text: "Tick the classification on a resident's record to add them here." }}
          cols={[
            { key: "name", header: "Name", cell: (r) => <Cell2 title={nameLastFirst(r)} sub={r.residentNo} href={`${routes.residents}/${r.id}`} /> },
            { key: "age", header: "Age / Sex", cell: (r) => `${ageOf(r.birthDate, now)} · ${label(SEX, r.sex)}` },
            { key: "purok", header: "Address", cell: (r) => <Cell2 title={r.purok?.name ?? "—"} sub={r.address} />, optional: true },
            {
              key: "detail",
              header: cls === "voter" ? "Precinct" : cls === "pwd" ? "Disability" : cls === "senior" ? "OSCA ID" : "Contact",
              cell: (r) => (cls === "voter" ? r.voterPrecinct : cls === "pwd" ? r.disability : cls === "senior" ? r.seniorIdNo : r.contactNumber) ?? "—",
              optional: true,
            },
            { key: "go", header: "", cell: (r) => <RowLink href={`${routes.residents}/${r.id}`} />, className: "text-right" },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={params} basePath={routes.classification} />
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
