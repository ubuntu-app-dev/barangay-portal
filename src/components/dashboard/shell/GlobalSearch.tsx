"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import { routes } from "@/config/navigation";
import { flattenWs, WORKSPACES, type WorkspaceKey } from "@/config/workspaces";
import { can } from "@/lib/auth/permissions";

type Hit = { value: string; label: string; sub?: string };
type Result = { href: string; title: string; sub?: string; group: "Pages" | "Residents" | "Households" };

/** Jump to a page, a resident, or a household. Press "/" anywhere to focus it. */
export default function GlobalSearch({ ws, permissions }: { ws: WorkspaceKey; permissions: string[] }) {
  const searchRecords = WORKSPACES[ws].searchRecords;
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [records, setRecords] = useState<{ residents: Hit[]; households: Hit[] }>({ residents: [], households: [] });

  const entries = useMemo(() => flattenWs(WORKSPACES[ws]).filter((e) => can(permissions, e.requires)), [ws, permissions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !searchRecords) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const [r, h] = await Promise.all(
          ["resident", "household"].map((type) => fetch(`/api/dashboard/lookup?type=${type}&q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then((x) => (x.ok ? (x.json() as Promise<Hit[]>) : []))),
        );
        setRecords({ residents: r.slice(0, 5), households: h.slice(0, 3) });
      } catch {
        /* aborted */
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, searchRecords]);

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pages: Result[] = entries
      .filter((e) => `${e.title} ${e.label} ${e.parent ?? ""}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((e) => ({ href: e.href, title: e.title, sub: e.parent, group: "Pages" }));
    if (q.length < 2 || !searchRecords) return pages;
    return [
      ...pages,
      ...records.residents.map((r) => ({ href: `${routes.residents}/${r.value}`, title: r.label, sub: r.sub, group: "Residents" as const })),
      ...records.households.map((h) => ({ href: `${routes.households}/${h.value}`, title: h.label, sub: h.sub, group: "Households" as const })),
    ];
  }, [entries, query, records, searchRecords]);

  const done = () => {
    setOpen(false);
    setQuery("");
    setRecords({ residents: [], households: [] });
  };
  const go = (r: Result) => {
    router.push(r.href);
    done();
  };

  return (
    <div
      role="search"
      className="relative w-full max-w-md"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={inputId} className="visually-hidden">
        Search pages, residents, and households
      </label>
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={query}
        autoComplete="off"
        placeholder={searchRecords ? "Search residents, households, pages" : "Search pages"}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) go(results[active]);
          else if (e.key === "Escape") done();
        }}
        className="h-10 w-full rounded-full border border-rule/80 bg-panel pl-10 pr-12 text-[14px] shadow-card transition focus:border-dash-primary focus:shadow-[0_0_0_4px_rgb(0_56_168/0.12)] focus:outline-none"
      />
      <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-rule bg-ground-muted px-1.5 text-[11px] font-semibold text-ink-secondary sm:block">
        /
      </kbd>
      {open && query.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-rule bg-panel shadow-pop">
          {results.length > 0 ? (
            <ul className="max-h-[60vh] overflow-auto p-1.5">
              {results.map((r, i) => (
                <li key={r.href}>
                  {(i === 0 || results[i - 1].group !== r.group) && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">{r.group}</p>}
                  <Link href={r.href} onClick={done} onMouseEnter={() => setActive(i)} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] ${i === active ? "bg-dash-primary-soft" : ""}`}>
                    <Icon name={r.group === "Residents" ? "user" : r.group === "Households" ? "home" : "arrowRight"} className="h-4 w-4 text-ink-secondary" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.title}</span>
                      {r.sub && <span className="block truncate text-[12px] text-ink-secondary">{r.sub}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-[14px] text-ink-secondary">No matches.</p>
          )}
        </div>
      )}
    </div>
  );
}
