"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Icon from "./Icon";

export type FilterDef = { name: string; label: string; options: { value: string; label: string }[] };

/** Search box and filters that live in the URL, so lists are shareable and the server does the work. */
export default function ListToolbar({
  placeholder = "Search",
  filters = [],
  children,
}: {
  placeholder?: string;
  filters?: FilterDef[];
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const push = (next: Record<string, string>) => {
    const s = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) s.set(k, v);
      else s.delete(k);
    }
    s.delete("page");
    const qs = s.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const active = filters.some((f) => params.get(f.name)) || !!params.get("q");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[220px] flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
        <input
          type="search"
          aria-label={placeholder}
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => push({ q: v.trim() }), 300);
          }}
          className="field pl-9"
        />
        {pending && (
          <span aria-hidden="true" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-dash-primary border-r-transparent" />
        )}
      </div>
      {filters.map((f) => (
        <select
          key={f.name}
          aria-label={f.label}
          value={params.get(f.name) ?? ""}
          onChange={(e) => push({ [f.name]: e.target.value })}
          className="field w-auto min-w-[150px]"
        >
          <option value="">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            push(Object.fromEntries([["q", ""], ...filters.map((f) => [f.name, ""])]));
          }}
          className="btn btn-ghost btn-sm"
        >
          <Icon name="close" className="h-3.5 w-3.5" /> Clear
        </button>
      )}
      {children && <div className="ml-auto flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
