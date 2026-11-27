import type { ReactNode } from "react";
import Icon from "@/components/dashboard/ui/Icon";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import type { BarangayBody } from "@/types/profile";

export default function BodiesGrid({ bodies, actions }: { bodies: BarangayBody[]; actions?: (b: BarangayBody) => ReactNode }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {bodies.map((b) => (
        <li key={b.id} className="surface flex flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-lg font-bold tracking-[-0.01em]">{b.name}</p>
            <StatusBadge status={b.status} />
          </div>
          <p className="mt-1 flex-1 text-[13px] text-ink-secondary">{b.fullName}</p>
          <dl className="mt-3 space-y-1.5 border-t border-rule pt-3 text-[13px]">
            <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Headed by</dt><dd className="font-semibold">{b.head || "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="flex items-center gap-1 text-ink-secondary"><Icon name="users" className="h-3.5 w-3.5" />Members</dt><dd className="font-semibold tabular-nums">{b.members}</dd></div>
          </dl>
          {actions && <div className="-mb-1 mt-2 flex justify-end gap-1 border-t border-rule/70 pt-2">{actions(b)}</div>}
        </li>
      ))}
    </ul>
  );
}
