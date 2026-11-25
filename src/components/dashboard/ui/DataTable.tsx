"use client";
import { useMemo, useState, type ReactNode } from "react";
import EmptyState from "./EmptyState";
import Icon from "./Icon";

export type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; sortValue?: (row: T) => string | number };

type Props<T> = {
  caption: string;
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchText: (row: T) => string;
  filter?: { label: string; options: string[]; pick: (row: T) => string };
  initialSort?: { key: string; dir: "asc" | "desc" };
  pageSize?: number;
  emptyTitle: string;
  emptyText: string;
};

/** Search, filter, sort, and pagination in one table. Scrolls sideways on small screens. */
export default function DataTable<T>({ caption, rows, columns, rowKey, searchText, filter, initialSort, pageSize = 5, emptyTitle, emptyText }: Props<T>) {
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => (!q || searchText(r).toLowerCase().includes(q)) && (!filter || filterValue === "All" || filter.pick(r) === filterValue));
    const col = columns.find((c) => c.key === sort?.key);
    if (col?.sortValue && sort) {
      const get = col.sortValue;
      out = [...out].sort((a, b) => {
        const x = get(a), y = get(b);
        return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === "asc" ? 1 : -1);
      });
    }
    return out;
  }, [rows, columns, query, filterValue, filter, sort, searchText]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = shown.slice(current * pageSize, (current + 1) * pageSize);
  const toggleSort = (key: string) => setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
          <input type="search" aria-label={`Search ${caption}`} placeholder="Search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className="h-10 w-full rounded-lg border border-rule bg-panel pl-9 pr-3 text-[14px]" />
        </div>
        {filter && (
          <select aria-label={filter.label} value={filterValue} onChange={(e) => { setFilterValue(e.target.value); setPage(0); }} className="h-10 rounded-lg border border-rule bg-panel px-3 text-[14px]">
            <option value="All">{filter.label}: All</option>
            {filter.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </div>

      {shown.length === 0 ? (
        <EmptyState title={emptyTitle} text={emptyText} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <caption className="visually-hidden">{caption}</caption>
            <thead>
              <tr className="border-b border-rule text-[12px] font-semibold text-ink-secondary">
                {columns.map((c) => (
                  <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined} className="px-3 py-2">
                    {c.sortValue ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 font-semibold hover:text-ink">
                        {c.header}
                        <Icon name={sort?.key === c.key && sort.dir === "asc" ? "trendUp" : "chevronDown"} className="h-3.5 w-3.5" />
                      </button>
                    ) : c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={rowKey(row)} className="border-b border-rule last:border-0 hover:bg-ground-muted/60">
                  {columns.map((c) => <td key={c.key} className="px-3 py-3 align-top">{c.cell(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown.length > pageSize && (
        <div className="mt-4 flex items-center justify-between text-[13px] text-ink-secondary">
          <span>Showing {current * pageSize + 1} to {Math.min((current + 1) * pageSize, shown.length)} of {shown.length}</span>
          <div className="flex gap-2">
            <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-lg border border-rule px-3 py-1.5 font-semibold disabled:opacity-50">Previous</button>
            <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-lg border border-rule px-3 py-1.5 font-semibold disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
