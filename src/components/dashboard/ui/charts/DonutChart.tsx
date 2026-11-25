import { formatNumber, formatPercent } from "@/lib/dashboard/format";
import type { ChartDatum } from "@/types/dashboard";

const COLORS = [
  "var(--dash-primary)",
  "var(--dash-gold)",
  "var(--dash-secondary)",
  "#8b94a5",
  "var(--dash-gold-ink)",
];
const R = 40;
const C = 2 * Math.PI * R;

/** Donut with a legend that carries the exact numbers, so the chart is never the only source. */
export default function DonutChart({
  data,
  label,
}: {
  data: ChartDatum[];
  label: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${label}: ${data.map((d) => `${d.label} ${formatNumber(d.value)}`).join(", ")}`}
        className="h-36 w-36 shrink-0 -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="var(--dp-color-rule)"
          strokeWidth="14"
        />
        {total > 0 &&
          data.map((d, i) => {
            const length = (d.value / total) * C;
            const circle = (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="14"
                strokeDasharray={`${length} ${C - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
      </svg>
      <ul className="min-w-[140px] flex-1 space-y-2 text-[14px]">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {d.label}
            </span>
            <span className="font-semibold tabular-nums">
              {formatNumber(d.value)}{" "}
              <span className="font-normal text-ink-secondary">
                ({formatPercent(d.value, total)})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
