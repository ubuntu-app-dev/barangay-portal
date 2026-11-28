"use client";
import { useEffect, useState } from "react";
import type { NavLink } from "@/types/landing";

/** Desktop menu. Underlines the link of the section currently in view. */
export default function PrimaryNav({ links }: { links: NavLink[] }) {
  const [active, setActive] = useState(links[0]?.href ?? "");

  useEffect(() => {
    // Watch every section, including ones without a menu link, so none of the links
    // stays highlighted while such a section (e.g. Data Privacy) is on screen.
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(`#${visible[0].target.id}`);
      },
      // A band across the upper middle of the screen decides which section is "current".
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [links]);

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 text-[15px] lg:flex">
      {links.map((l) => {
        const on = l.href === active;
        return (
          <a
            key={l.href}
            href={l.href}
            aria-current={on ? "location" : undefined}
            className={`relative rounded-md px-3 py-2 transition-colors ${
              on ? "font-semibold text-brand" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {l.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand transition-opacity ${on ? "opacity-100" : "opacity-0"}`}
            />
          </a>
        );
      })}
    </nav>
  );
}
