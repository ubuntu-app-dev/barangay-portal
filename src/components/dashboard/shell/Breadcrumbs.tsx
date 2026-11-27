"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findAncestorIn, WORKSPACES, type WorkspaceKey } from "@/config/workspaces";

const WORDS: Record<string, string> = { new: "New", edit: "Edit" };

export default function Breadcrumbs({ ws: wsKey }: { ws: WorkspaceKey }) {
  const pathname = usePathname();
  const ws = WORKSPACES[wsKey];
  const home = wsKey === "secretary" ? "Dashboard" : "Overview";
  const onHome = pathname === ws.base;
  const found = findAncestorIn(ws, pathname);
  const crumbs: { label: string; href?: string }[] = [];
  if (!onHome) crumbs.push({ label: home, href: ws.base });
  if (found) {
    if (found.entry.parent) crumbs.push({ label: found.entry.parent });
    const tail = found.rest.map((s) => WORDS[s] ?? "Details");
    crumbs.push({ label: found.entry.title, href: tail.length ? found.entry.href : undefined });
    // "abc123/edit" reads as "Details / Edit"; show only the last word.
    if (tail.length) crumbs.push({ label: tail[tail.length - 1] });
  } else crumbs.push({ label: onHome ? home : (pathname.split("/").pop()?.replace(/-/g, " ") ?? "") });

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 max-w-[38%] shrink md:block">
      <ol className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="truncate font-semibold capitalize text-ink">
                  {c.label}
                </span>
              ) : c.href ? (
                <Link href={c.href} className="truncate hover:text-ink hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate">{c.label}</span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
