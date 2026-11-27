import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Select } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatNumber, formatPercent } from "@/lib/dashboard/format";
import { CONDITION, WATER, WATER_SHORT, label, options } from "@/lib/labels";
import { setWaterSource } from "@/server/actions/community";
import { flat, type SearchParams } from "@/server/params";
import { waterOverview } from "@/server/queries/community";

export const metadata: Metadata = { title: "Water Service Classification" };

const LEVELS = Object.keys(WATER_SHORT) as (keyof typeof WATER_SHORT)[];
const TONE: Record<string, string> = { LEVEL_III: "bg-dash-primary", LEVEL_II: "bg-dash-secondary", LEVEL_I: "bg-dash-gold", DELIVERED: "bg-[#8b94a5]", OTHER: "bg-rule" };
const TEXT: Record<string, string> = {
  LEVEL_III: "Piped water with a faucet in the house.",
  LEVEL_II: "Piped to a communal faucet shared by nearby houses.",
  LEVEL_I: "Point source: protected well, spring, or hand pump.",
  DELIVERED: "Bought from a refilling station or delivered by tanker.",
  OTHER: "Rain collection, river, or other sources.",
};

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const d = await waterOverview(session, sp);
  const total = d.groups.reduce((s, g) => s + g._count, 0);
  const count = (lvl: string) => d.groups.find((g) => g.waterSource === lvl)?._count ?? 0;
  const safe = count("LEVEL_III") + count("LEVEL_II");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Community Resources" icon="droplet" title="Water Service Classification" description="Households by water service level (Level I to III). Update a household's source here or on its record." />

      <section aria-label="Households by water service level" className="surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-ink-secondary">Households with piped water (Level II or III)</p>
            <p className="font-display text-[34px] font-bold leading-tight tabular-nums">
              {formatPercent(safe, total)} <span className="text-[15px] font-medium text-ink-secondary">of {formatNumber(total)} households</span>
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="mt-4 flex h-3 overflow-hidden rounded-full bg-ground-muted">
          {LEVELS.map((l) => (
            <span key={l} className={TONE[l]} style={{ width: `${total ? (count(l) / total) * 100 : 0}%` }} />
          ))}
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {LEVELS.map((l) => (
            <li key={l}>
              <Link href={`${routes.water}?water=${l}`} scroll={false} className={`block rounded-2xl border p-4 transition hover:border-dash-primary/40 ${sp.water === l ? "border-dash-primary bg-dash-primary-soft/50" : "border-rule/80"}`}>
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${TONE[l]}`} />
                  {label(WATER_SHORT, l)}
                </p>
                <p className="mt-1 font-display text-[24px] font-bold tabular-nums">{formatNumber(count(l))}</p>
                <p className="text-[12px] text-ink-secondary">{TEXT[l]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="By purok" icon="mapPin" className="xl:col-span-2" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[560px]">
              <caption className="visually-hidden">Households by purok and water level</caption>
              <thead>
                <tr>
                  <th scope="col">Purok</th>
                  {LEVELS.map((l) => (
                    <th key={l} scope="col" className="text-right">
                      {label(WATER_SHORT, l)}
                    </th>
                  ))}
                  <th scope="col" className="text-right">
                    Piped
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.puroks.map((p) => {
                  const c = (l: string) => d.byPurok.find((x) => x.purokId === p.id && x.waterSource === l)?._count ?? 0;
                  const all = LEVELS.reduce((s, l) => s + c(l), 0);
                  return (
                    <tr key={p.id}>
                      <th scope="row" className="font-semibold">
                        <Link href={`${routes.water}?purok=${p.id}`} className="hover:text-dash-primary hover:underline">
                          {p.name}
                        </Link>
                      </th>
                      {LEVELS.map((l) => (
                        <td key={l} className="text-right tabular-nums">
                          {c(l) || <span className="text-ink-secondary">0</span>}
                        </td>
                      ))}
                      <td className="text-right font-semibold tabular-nums">{formatPercent(c("LEVEL_III") + c("LEVEL_II"), all)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Water systems" icon="droplet" actionLabel="Manage" actionHref={`${routes.resources}?category=WATER_SYSTEM`}>
          {d.systems.length === 0 ? (
            <p className="text-[14px] text-ink-secondary">No water systems in the resource inventory yet.</p>
          ) : (
            <ul className="divide-y divide-rule/70">
              {d.systems.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Cell2 title={s.name} sub={`${s.quantity} ${s.unit}${s.location ? ` · ${s.location}` : ""}`} />
                  <StatusBadge status={label(CONDITION, s.condition)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title={`${formatNumber(d.total)} household${d.total === 1 ? "" : "s"}`} icon="home">
        <ListToolbar
          placeholder="Search household no. or street"
          filters={[
            { name: "water", label: "Level", options: options(WATER_SHORT) },
            { name: "purok", label: "Purok", options: d.puroks.map((p) => ({ value: p.id, label: p.name })) },
          ]}
        />
        <Table
          caption="Households and water source"
          rows={d.rows}
          rowKey={(h) => h.id}
          cols={[
            { key: "hh", header: "Household", cell: (h) => <Cell2 title={h.householdNo} sub={h.members[0] ? `${h.members[0].firstName} ${h.members[0].lastName}` : undefined} href={`${routes.households}/${h.id}`} /> },
            { key: "addr", header: "Address", cell: (h) => <Cell2 title={h.purok?.name ?? "—"} sub={h.address} />, optional: true },
            { key: "members", header: "Members", cell: (h) => <span className="tabular-nums">{h._count.members}</span>, optional: true },
            { key: "water", header: "Water source", cell: (h) => <span title={label(WATER, h.waterSource)}>{label(WATER_SHORT, h.waterSource)}</span> },
            {
              key: "edit",
              header: "",
              className: "text-right",
              cell: (h) => (
                <ActionDialog trigger={<><Icon name="edit" className="h-3.5 w-3.5" /> Change</>} triggerClassName="btn btn-ghost btn-sm" title={`Water source of ${h.householdNo}`} action={setWaterSource} hidden={{ id: h.id }} confirmLabel="Save" icon="droplet">
                  <Select name="waterSource" label="Main water source" options={options(WATER)} defaultValue={h.waterSource} required />
                </ActionDialog>
              ),
            },
          ]}
        />
        <Pagination page={d.page} pageSize={d.pageSize} total={d.total} params={flat(sp)} basePath={routes.water} />
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
