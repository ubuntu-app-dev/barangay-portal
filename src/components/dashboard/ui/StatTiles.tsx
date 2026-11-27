import Link from "next/link";
import Icon from "./Icon";
import type { IconName } from "./icon-paths";

export type Tile = {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "primary" | "gold" | "success" | "secondary" | "danger";
};
const tones = {
  primary: "bg-dash-primary-soft text-dash-primary",
  gold: "bg-dash-gold-soft text-dash-gold-ink",
  success: "bg-dash-success-soft text-dash-success",
  secondary: "bg-dash-secondary-soft text-dash-secondary",
  danger: "bg-dash-danger-soft text-dash-danger",
};

/** A row of small number cards. */
export default function StatTiles({ tiles, columns = 4 }: { tiles: Tile[]; columns?: 3 | 4 | 5 }) {
  const grid = { 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" }[columns];
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${grid}`}>
      {tiles.map((t) => {
        const body = (
          <>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[t.tone ?? "primary"]}`}>
              <Icon name={t.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink-secondary">{t.label}</p>
              <p className="font-display text-[26px] font-bold leading-tight tracking-[-0.03em] tabular-nums">{t.value}</p>
              {t.hint && <p className="truncate text-[12px] text-ink-secondary">{t.hint}</p>}
            </div>
          </>
        );
        const cls = "surface flex h-full items-center gap-4 p-4";
        return (
          <li key={t.label}>
            {t.href ? (
              <Link href={t.href} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0`}>
                {body}
              </Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
