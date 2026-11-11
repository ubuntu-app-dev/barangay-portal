import type { ReactNode } from "react";
import type { BentoCopy } from "@/types/systems";

type Props = BentoCopy & {
  children: ReactNode;
  decorative?: boolean;
  className?: string;
};

const dots =
  "[background-image:radial-gradient(circle,rgb(22_25_31/0.09)_1px,transparent_1px)] [background-size:12px_12px]";

/** Shared bento shell: an illustrated scene on top, copy underneath. */
export default function BentoCard({
  tag,
  title,
  text,
  chips,
  children,
  decorative = true,
  className = "",
}: Props) {
  return (
    <article
      className={`card-lift flex h-full min-h-[380px] flex-col overflow-hidden rounded-panel border border-rule bg-panel shadow-[0_1px_2px_rgb(22_25_31/0.04),0_10px_24px_rgb(22_25_31/0.06)] ${className}`}
    >
      <div
        aria-hidden={decorative || undefined}
        className={`relative min-h-[230px] flex-1 overflow-hidden bg-ground-muted ${dots}`}
      >
        {children}
      </div>
      <div className="p-6">
        <p className="text-[13px] font-semibold text-brand">{tag}</p>
        <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.02em]">
          {title}
        </h3>
        <p className="mt-2 max-w-[52ch] text-[15px] text-ink-secondary">
          {text}
        </p>
        {chips && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li
                key={c}
                className="rounded-full border border-rule bg-ground-muted px-3 py-1 text-[13px]"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
