import type { ReactNode } from "react";

/** Label/value pairs for detail pages. Empty values show a dash so gaps are visible. */
export default function DetailList({ rows, columns = 2 }: { rows: [string, ReactNode][]; columns?: 1 | 2 | 3 }) {
  const grid = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 xl:grid-cols-3" }[columns];
  return (
    <dl className={`grid gap-x-8 gap-y-4 ${grid}`}>
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">{label}</dt>
          <dd className="mt-0.5 break-words text-[14.5px] font-medium">{value === null || value === undefined || value === "" ? <span className="text-ink-secondary">—</span> : value}</dd>
        </div>
      ))}
    </dl>
  );
}
