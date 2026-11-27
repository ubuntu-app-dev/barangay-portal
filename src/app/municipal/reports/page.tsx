import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ReportView from "@/components/reports/ReportView";
import { requireRole } from "@/lib/auth/staff";
import { formatNumber } from "@/lib/dashboard/format";
import { REPORT_KIND, label } from "@/lib/labels";
import { oneOf, str, type SearchParams } from "@/server/params";
import { activeBarangays } from "@/server/queries/municipal";
import { buildConsolidated, CONSOLIDATED_KINDS, PERIODIC, PERIODS, resolvePeriod } from "@/server/reports";
import type { ReportKindKey } from "@/types/reports";

export const metadata: Metadata = { title: "Consolidated Reports" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const sp = await searchParams;
  const kind = (oneOf(str(sp.kind), CONSOLIDATED_KINDS) ?? "DEMOGRAPHICS") as ReportKindKey;
  const period = resolvePeriod(str(sp.period));
  const barangays = await activeBarangays(u);
  const { report, byBarangay } = await buildConsolidated(kind, barangays.map((b) => ({ code: b.code, name: b.name })), period, `Municipality of ${u.municipality!.name}, ${u.municipality!.province}`);
  const cols = byBarangay[0]?.values.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader eyebrow="Municipality" icon="chart" title="Consolidated Reports" description="Figures of every active barangay, added together, straight from their records (not from what they submitted). VAWC cases are never included." />
        <form method="get" className="surface flex flex-wrap items-end gap-4 p-5">
          <label className="block min-w-[220px] flex-1">
            <span className="mb-1.5 block text-[13px] font-semibold">Report</span>
            <select name="kind" defaultValue={kind} className="field">
              {CONSOLIDATED_KINDS.map((k) => (
                <option key={k} value={k}>
                  {label(REPORT_KIND, k)}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[180px]">
            <span className="mb-1.5 block text-[13px] font-semibold">Period</span>
            <select name="period" defaultValue={period.key} className="field">
              {Object.entries(PERIODS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">
            <Icon name="fileChart" className="h-4 w-4" /> Generate
          </button>
          <PrintPageButton />
        </form>
        {!PERIODIC.includes(kind) && <p className="-mt-3 text-[12.5px] text-ink-secondary">This report shows the records as of today; the period does not apply.</p>}
      </div>
      <ReportView report={report} printable />
      <Card title="By barangay" icon="building" bodyClassName="p-0" className="break-inside-avoid">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[560px]">
            <caption className="visually-hidden">Figures by barangay</caption>
            <thead>
              <tr>
                <th scope="col">Barangay</th>
                {cols.map((c) => (
                  <th key={c.label} scope="col" className="text-right">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byBarangay.map((b) => (
                <tr key={b.code}>
                  <th scope="row" className="font-semibold">
                    {b.name}
                  </th>
                  {cols.map((c) => (
                    <td key={c.label} className="text-right tabular-nums">
                      {formatNumber(b.values.find((v) => v.label === c.label)?.value ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
