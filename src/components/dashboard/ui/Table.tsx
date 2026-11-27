import Link from "next/link";
import type { ReactNode } from "react";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import type { IconName } from "./icon-paths";

export type Col<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide on small screens. */
  optional?: boolean;
};

type Props<T> = {
  caption: string;
  rows: T[];
  cols: Col<T>[];
  rowKey: (row: T) => string;
  empty?: { title: string; text: string; icon?: IconName };
};

/** A server-rendered table. Search, filters, and pages come from the URL (see ListToolbar and Pagination). */
export default function Table<T>({ caption, rows, cols, rowKey, empty }: Props<T>) {
  if (rows.length === 0)
    return <EmptyState icon={empty?.icon ?? "inbox"} title={empty?.title ?? "Nothing here yet"} text={empty?.text ?? "Records you add will show up here."} />;
  return (
    <div className="-mx-5 overflow-x-auto sm:mx-0 sm:rounded-xl sm:border sm:border-rule/80">
      <table className="data-table min-w-[640px]">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key} scope="col" className={`${c.optional ? "hidden md:table-cell" : ""} ${c.className ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {cols.map((c) => (
                <td key={c.key} className={`${c.optional ? "hidden md:table-cell" : ""} ${c.className ?? ""}`}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Primary text with a muted line under it, for name + detail cells. */
export function Cell2({ title, sub, href }: { title: ReactNode; sub?: ReactNode; href?: string }) {
  return (
    <div className="min-w-0 leading-tight">
      {href ? (
        <Link href={href} className="font-semibold text-ink hover:text-dash-primary hover:underline">
          {title}
        </Link>
      ) : (
        <p className="font-semibold">{title}</p>
      )}
      {sub && <p className="mt-0.5 text-[12.5px] text-ink-secondary">{sub}</p>}
    </div>
  );
}

export function RowLink({ href, label = "View", icon = "arrowRight" }: { href: string; label?: string; icon?: IconName }) {
  return (
    <Link href={href} className="btn btn-ghost btn-sm whitespace-nowrap text-dash-primary">
      {label}
      <Icon name={icon} className="h-3.5 w-3.5" />
    </Link>
  );
}
