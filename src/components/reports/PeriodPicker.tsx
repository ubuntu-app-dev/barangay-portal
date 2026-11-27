"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const PERIODS: [string, string][] = [
  ["this-month", "This month"],
  ["last-month", "Last month"],
  ["this-quarter", "This quarter"],
  ["last-quarter", "Last quarter"],
  ["this-year", "This year"],
  ["last-12", "Last 12 months"],
];

export default function PeriodPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-[13px] font-semibold">
      Period
      <select
        value={params.get("period") ?? "this-month"}
        aria-busy={pending}
        onChange={(e) => {
          const s = new URLSearchParams(params.toString());
          s.set("period", e.target.value);
          start(() => router.replace(`${pathname}?${s}`, { scroll: false }));
        }}
        className="field w-auto min-w-[170px]"
      >
        {PERIODS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
