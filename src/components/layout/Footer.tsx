"use client";

import Link from "next/link";
import { Brand } from "@/components/logo";
import { TricolorRule } from "@/components/shared";
import { container } from "@/lib/styles";
import { brand } from "@/lib/brand";
import { footerContent } from "@/data/footer-content";

const currentYear = 2026;
export default function Footer() {
  return (
    <footer data-surface="dark" className="brand-field-deep text-on-field">
      <div
        className={`${container} grid grid-cols-2 gap-x-6 gap-y-10 border-t border-on-field-secondary/20 py-12 md:grid-cols-[1.5fr_1fr_1fr]`}
      >
        <div className="col-span-2 md:col-span-1">
          <Brand onDark />
          <p className="mt-4 max-w-[38ch] text-[14px] text-on-field-secondary">
            {brand.tagline}
          </p>
          <p className="mt-2 max-w-[38ch] text-[14px] text-on-field-secondary">
            {footerContent.blurb}
          </p>
        </div>
        {footerContent.groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="font-display text-[15px] font-bold">{g.title}</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-on-field-secondary">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-on-field hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div
        className={`${container} flex flex-wrap items-center justify-between gap-3 border-t border-on-field-secondary/20 py-5 text-[13px] text-on-field-secondary`}
      >
        <p>
          &copy; {currentYear} {brand.name}
        </p>
        <a href="#main" className="hover:text-on-field hover:underline">
          Back to top <span aria-hidden="true">&uarr;</span>
        </a>
      </div>
      <TricolorRule />
    </footer>
  );
}
