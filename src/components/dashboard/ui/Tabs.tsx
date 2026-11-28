"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type TabDef = { label: string; href: string; count?: number };

/** Pill tabs made of links. Active when the path (and the query, if the tab has one) matches. */
export default function Tabs({ tabs, label }: { tabs: TabDef[]; label: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = `${pathname}${params.toString() ? `?${params}` : ""}`;
  const isActive = (href: string) => (href.includes("?") ? current.startsWith(href) : pathname === href && !tabs.some((t) => t.href.includes("?") && current.startsWith(t.href)));
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto px-1 pb-1">
      <ul className="inline-flex gap-1 rounded-2xl border border-rule/80 bg-panel p-1 shadow-card">
        {tabs.map((t) => {
          const active = isActive(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-colors motion-reduce:transition-none ${active ? "bg-brand-fill text-white shadow-sm" : "text-ink-secondary hover:bg-ground-muted hover:text-ink"}`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/20" : "bg-ground-muted"}`}>{t.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
