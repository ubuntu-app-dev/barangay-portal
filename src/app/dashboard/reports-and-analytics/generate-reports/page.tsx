import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ReportView from "@/components/reports/ReportView";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { REPORT_KIND, options } from "@/lib/labels";
import { oneOf, str, type SearchParams } from "@/server/params";
import { buildReport, PERIODS, resolvePeriod } from "@/server/reports";
import type { ReportKindKey } from "@/types/reports";

export const metadata: Metadata = { title: "Generate Reports" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const kind = oneOf(str(sp.kind), REPORT_KIND) as ReportKindKey | undefined;
  const custom = str(sp.period) === "custom";
  const period = resolvePeriod(str(sp.period), custom ? str(sp.from) : undefined, custom ? str(sp.to) : undefined);
  const report = kind ? await buildReport(kind, session.barangay.code, period) : null;
  const qs = new URLSearchParams({ ...(kind ? { kind } : {}), period: str(sp.period) ?? "this-month", ...(custom ? { from: str(sp.from) ?? "", to: str(sp.to) ?? "" } : {}) });

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader eyebrow="Reports and Analytics" icon="fileChart" title="Generate Reports" description="Pick a report and a period, then print it, download it as CSV, or submit it to the municipality." />
        {/* A plain GET form: works without JavaScript and gives a shareable link. */}
        <form method="get" className="surface grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Report</span>
            <select name="kind" defaultValue={kind ?? ""} required className="field">
              <option value="" disabled>
                Choose a report
              </option>
              {options(REPORT_KIND)
                .filter((o) => o.value !== "OTHER")
                .map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">Period</span>
            <select name="period" defaultValue={str(sp.period) ?? "this-month"} className="field">
              {Object.entries(PERIODS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
              <option value="custom">Custom dates</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">From (custom)</span>
            <input type="date" name="from" defaultValue={str(sp.from)} className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold">To (custom)</span>
            <input type="date" name="to" defaultValue={str(sp.to)} className="field" />
          </label>
          <button type="submit" className="btn btn-primary">
            <Icon name="fileChart" className="h-4 w-4" /> Generate
          </button>
        </form>
        <p className="-mt-3 text-[12.5px] text-ink-secondary">The period applies to Certificate Issuance and Blotter reports. The others show the records as of today.</p>
      </div>

      {report ? (
        <>
          <div className="no-print flex flex-wrap justify-end gap-2">
            <a href={`/api/dashboard/export/report?${qs}`} className="btn btn-secondary">
              <Icon name="download" className="h-4 w-4" /> Download CSV
            </a>
            <PrintPageButton />
            <Link href={`${routes.submitReport}?${qs}`} className="btn btn-primary">
              <Icon name="send" className="h-4 w-4" /> Submit to municipality
            </Link>
          </div>
          <ReportView report={report} printable />
        </>
      ) : (
        <div className="surface grid gap-4 p-6 md:grid-cols-3">
          {options(REPORT_KIND)
            .filter((o) => o.value !== "OTHER")
            .map((o) => (
              <Link key={o.value} href={`${routes.generateReport}?kind=${o.value}`} className="flex items-center gap-3 rounded-2xl border border-rule/80 p-4 hover:border-dash-primary/40 hover:bg-dash-primary-soft/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary">
                  <Icon name="fileChart" className="h-5 w-5" />
                </span>
                <span className="font-semibold">{o.label}</span>
              </Link>
            ))}
        </div>
      )}
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
