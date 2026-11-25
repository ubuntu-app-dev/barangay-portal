"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavEntry, routes } from "@/config/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const entry = findNavEntry(pathname);
  const onHome = pathname === routes.home;
  const current = onHome
    ? "Dashboard"
    : (entry?.title ??
      pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ??
      "");

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
        {!onHome && (
          <li className="flex items-center gap-1.5">
            <Link href={routes.home} className="hover:text-ink hover:underline">
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        )}
        {entry?.parent && (
          <li className="flex items-center gap-1.5 truncate">
            <span>{entry.parent}</span>
            <span aria-hidden="true">/</span>
          </li>
        )}
        <li
          aria-current="page"
          className="truncate font-semibold capitalize text-ink"
        >
          {current}
        </li>
      </ol>
    </nav>
  );
}
