"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { flattenNav } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import Icon from "@/components/dashboard/ui/Icon";

/** Jump to any page you are allowed to open. Searching records needs the database, which is not connected yet. */
export default function GlobalSearch({
  permissions,
}: {
  permissions: string[];
}) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const entries = useMemo(
    () => flattenNav().filter((e) => can(permissions, e.requires)),
    [permissions],
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? entries
          .filter((e) =>
            `${e.title} ${e.label} ${e.parent ?? ""}`.toLowerCase().includes(q),
          )
          .slice(0, 7)
      : [];
  }, [entries, query]);
  const done = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      role="search"
      className="relative w-full max-w-sm"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={inputId} className="visually-hidden">
        Search pages
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
      />
      <input
        id={inputId}
        type="search"
        value={query}
        placeholder="Search pages"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            router.push(results[0].href);
            done();
          }
          if (e.key === "Escape") done();
        }}
        className="h-10 w-full rounded-full border border-rule bg-panel pl-10 pr-4 text-[14px]"
      />
      {open && query.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-rule bg-panel shadow-xl">
          {results.length > 0 ? (
            <ul className="p-1">
              {results.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={done}
                    className="block rounded-lg px-3 py-2 text-[14px] hover:bg-ground-muted"
                  >
                    <span className="font-semibold">{r.title}</span>
                    {r.parent && (
                      <span className="block text-[12px] text-ink-secondary">
                        {r.parent}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-[14px] text-ink-secondary">
              No matching pages.
            </p>
          )}
          <p className="border-t border-rule px-4 py-2 text-[12px] text-ink-secondary">
            Searching your barangay&rsquo;s records will work once the database
            is connected.
          </p>
        </div>
      )}
    </div>
  );
}
