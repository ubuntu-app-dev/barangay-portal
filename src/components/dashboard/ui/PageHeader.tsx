import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "./icon-paths";

type Props = {
  title: string;
  description?: ReactNode;
  /** Section name shown above the title, e.g. "Resident Management". */
  eyebrow?: string;
  icon?: IconName;
  back?: { href: string; label: string };
  children?: ReactNode;
};

export default function PageHeader({ title, description, eyebrow, icon, back, children }: Props) {
  return (
    <header className="space-y-3">
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-secondary hover:text-dash-primary">
          <Icon name="chevronLeft" className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {icon && (
            <span
              aria-hidden="true"
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-dash-primary to-[#1f4fbf] text-white shadow-[0_8px_20px_rgb(0_56_168/0.25)] sm:flex"
            >
              <Icon name={icon} className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dash-primary">{eyebrow}</p>}
            <h1 className="font-display text-[clamp(1.45rem,2.4vw,1.9rem)] font-bold leading-tight tracking-[-0.02em]">{title}</h1>
            {description && <p className="mt-1 max-w-[72ch] text-[14.5px] text-ink-secondary">{description}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
      </div>
    </header>
  );
}
