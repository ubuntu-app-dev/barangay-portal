import { formatDateTime } from "@/lib/dashboard/format";
import { AUDIT_ACTION, FIELD_LABELS, label } from "@/lib/labels";

type Row = { id: string; action: string; actorName: string; summary: string; changes: unknown; createdAt: Date };

const show = (v: unknown) => (v === null || v === undefined || v === "" ? "empty" : v === true ? "Yes" : v === false ? "No" : String(v));

/** Who changed what and when, with before → after for each field. */
export default function ChangeHistory({ rows, compact }: { rows: Row[]; compact?: boolean }) {
  if (rows.length === 0) return <p className="text-[14px] text-ink-secondary">No changes recorded yet.</p>;
  return (
    <ol className="space-y-4">
      {rows.map((h) => {
        const changes = h.changes && typeof h.changes === "object" ? Object.entries(h.changes as Record<string, [unknown, unknown]>) : [];
        return (
          <li key={h.id} className="border-l-2 border-dash-primary/25 pl-3">
            <p className="text-[13.5px] font-semibold leading-snug">{compact ? label(AUDIT_ACTION, h.action) : h.summary}</p>
            <p className="text-[12px] text-ink-secondary">
              {h.actorName} · {formatDateTime(h.createdAt.toISOString())}
            </p>
            {changes.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-[12.5px]">
                {changes.slice(0, 8).map(([field, pair]) => (
                  <li key={field} className="text-ink-secondary">
                    <span className="font-medium text-ink">{FIELD_LABELS[field] ?? field}</span>: <s className="decoration-ink-secondary/50">{show(pair?.[0])}</s> → {show(pair?.[1])}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
