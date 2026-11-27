import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "./icon-paths";

type Props = {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  actionHref?: string;
  /** Anything else for the right side of the header (buttons, dialogs). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export default function Card({ title, description, icon, actionLabel, actionHref, actions, children, className = "", bodyClassName = "p-5" }: Props) {
  return (
    <section aria-label={title} className={`surface ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule/80 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary">
              <Icon name={icon} className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-[16px] font-bold tracking-[-0.01em]">{title}</h2>
            {description && <p className="text-[13px] text-ink-secondary">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {actionLabel && actionHref && (
            <Link href={actionHref} className="inline-flex items-center gap-1 text-[13px] font-semibold text-dash-primary hover:underline">
              {actionLabel}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
