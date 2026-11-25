import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";

type Props = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
  className?: string;
};

export default function Card({
  title,
  actionLabel,
  actionHref,
  children,
  className = "",
}: Props) {
  return (
    <section
      aria-label={title}
      className={`rounded-2xl border border-rule bg-panel shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-4">
        <h2 className="font-display text-[16px] font-bold tracking-[-0.01em]">
          {title}
        </h2>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-dash-primary hover:underline"
          >
            {actionLabel}
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
