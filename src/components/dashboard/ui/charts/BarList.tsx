import { formatNumber } from "@/lib/dashboard/format";
import type { ChartDatum } from "@/types/dashboard";

/** Horizontal bars. Each row shows its number as text. */
export default function BarList({
  data,
  tone = "primary",
}: {
  data: ChartDatum[];
  tone?: "primary" | "secondary";
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[14px]">
            <span>{d.label}</span>
            <span className="font-semibold tabular-nums">
              {formatNumber(d.value)}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-2.5 overflow-hidden rounded-full bg-ground-muted"
          >
            <div
              className={`h-full rounded-full ${tone === "primary" ? "bg-dash-primary" : "bg-dash-secondary"}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
