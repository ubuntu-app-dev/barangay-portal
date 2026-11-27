import BarList from "@/components/dashboard/ui/charts/BarList";
import DonutChart from "@/components/dashboard/ui/charts/DonutChart";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import type { ReportData } from "@/types/reports";

/** Renders any generated report: highlight numbers, then each section as a chart and an exact table. */
export default function ReportView({ report, printable = false }: { report: ReportData; printable?: boolean }) {
  return (
    <article className={`print-area ${printable ? "surface p-6 sm:p-10" : ""}`}>
      {printable && (
        <header className="mb-6 border-b-4 border-double border-rule pb-4 text-center">
          <p className="text-[13px] text-ink-secondary">{report.barangay}</p>
          <h2 className="font-display text-[24px] font-bold tracking-[-0.01em]">{report.title} Report</h2>
          <p className="text-[13.5px] text-ink-secondary">
            {report.period ? report.period.label : "As of"} · Generated {formatDateTime(report.generatedAt)}
          </p>
        </header>
      )}
      {report.highlights.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {report.highlights.map((h) => (
            <div key={h.label} className="rounded-2xl border border-rule/80 bg-panel px-4 py-3">
              <dt className="text-[12.5px] font-medium text-ink-secondary">{h.label}</dt>
              <dd className="font-display text-[26px] font-bold tabular-nums tracking-[-0.02em]">{formatNumber(h.value)}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {report.sections.map((s) => (
          <section key={s.title} className="break-inside-avoid rounded-2xl border border-rule/80 bg-panel p-5">
            <h3 className="mb-4 font-display text-[15px] font-bold">{s.title}</h3>
            {s.rows.length === 0 ? (
              <p className="text-[14px] text-ink-secondary">No records for this period.</p>
            ) : s.rows.some((r) => r.text) ? (
              <dl className="divide-y divide-rule/70">
                {s.rows.map((r) => (
                  <div key={`${r.label}-${r.text}`} className="flex justify-between gap-4 py-2 text-[14px]">
                    <dt className="text-ink-secondary">{r.label}</dt>
                    <dd className="text-right font-semibold">{r.text}</dd>
                  </div>
                ))}
              </dl>
            ) : s.chart === "donut" ? (
              <DonutChart data={s.rows} label={s.title} />
            ) : (
              <BarList data={s.rows} />
            )}
            {s.note && <p className="mt-3 text-[12px] text-ink-secondary">{s.note}</p>}
          </section>
        ))}
      </div>
      {report.note && <p className="mt-4 text-[12.5px] text-ink-secondary">{report.note}</p>}
      {printable && (
        <footer className="mt-12 hidden grid-cols-2 gap-10 text-center text-[13px] print:grid">
          <div>
            <p className="border-b border-ink pb-1 font-semibold">&nbsp;</p>
            <p className="pt-1">Prepared by (Barangay Secretary)</p>
          </div>
          <div>
            <p className="border-b border-ink pb-1 font-semibold">&nbsp;</p>
            <p className="pt-1">Noted by (Punong Barangay)</p>
          </div>
        </footer>
      )}
    </article>
  );
}
