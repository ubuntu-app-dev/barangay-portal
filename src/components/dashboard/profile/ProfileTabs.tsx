"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hrefOf, navSections } from "@/config/navigation";

const profile = navSections.flatMap((s) => s.items).find((i) => i.id === "profile");
const tabs = (profile?.children ?? []).map((c) => ({ label: c.label, href: profile ? hrefOf(profile, c) : "#" }));

/** Pill tabs across the four profile pages (names come from the menu config). */
export default function ProfileTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Barangay profile sections" className="overflow-x-auto">
      <ul className="inline-flex gap-1 rounded-full border border-rule bg-panel p-1 shadow-sm">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={`block whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold transition-colors motion-reduce:transition-none ${active ? "bg-brand/10 text-brand" : "text-ink-secondary hover:bg-ground-muted hover:text-ink"}`}>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
