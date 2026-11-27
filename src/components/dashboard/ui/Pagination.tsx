import Link from "next/link";
import { formatNumber } from "@/lib/dashboard/format";
import Icon from "./Icon";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  /** Current search params, so filters survive page changes. */
  params: Record<string, string | undefined>;
  basePath: string;
};

export default function Pagination({ page, pageSize, total, params, basePath }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn = "btn btn-secondary btn-sm";
  return (
    <nav aria-label="Pages" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-ink-secondary">
      <p>
        Showing <strong className="text-ink">{formatNumber(from)}</strong> to <strong className="text-ink">{formatNumber(to)}</strong> of{" "}
        <strong className="text-ink">{formatNumber(total)}</strong>
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className={btn} rel="prev">
              <Icon name="chevronLeft" className="h-4 w-4" /> Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={btn}>
              <Icon name="chevronLeft" className="h-4 w-4" /> Previous
            </span>
          )}
          <span className="px-1 tabular-nums">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={href(page + 1)} className={btn} rel="next">
              Next <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-disabled="true" className={btn}>
              Next <Icon name="chevronRight" className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
