import Link from "next/link";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import Icon from "@/components/dashboard/ui/Icon";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { formatDate, formatPeso, nameLastFirst } from "@/lib/dashboard/format";
import { voidDocument } from "@/server/actions/documents";
import type { IssuedStatus } from "@/types/documents";

export type IssuedRow = {
  id: string;
  controlNo: string;
  purpose: string;
  issuedAt: Date;
  validUntil: Date | null;
  orNumber: string | null;
  fee: { toString(): string };
  printCount: number;
  voidReason: string | null;
  display: IssuedStatus;
  resident: { id: string; firstName: string; middleName: string | null; lastName: string; suffix: string | null };
  documentType: { name: string };
};

/** The register of issued documents. Voided rows stay in the list: records are never deleted. */
export default function IssuedTable({ rows, showType = true }: { rows: IssuedRow[]; showType?: boolean }) {
  return (
    <Table
      caption="Issued documents"
      rows={rows}
      rowKey={(r) => r.id}
      empty={{ icon: "fileCheck", title: "No documents found", text: "Issued documents will be listed here. Try a different search or clear the filters." }}
      cols={[
        { key: "no", header: "Control no.", cell: (r) => <Cell2 title={<span className="tabular-nums">{r.controlNo}</span>} sub={showType ? r.documentType.name : undefined} href={`${routes.printDocument}/${r.id}`} /> },
        {
          key: "resident",
          header: "Resident",
          cell: (r) => (
            <Link href={`${routes.residents}/${r.resident.id}`} className="font-medium hover:text-dash-primary hover:underline">
              {nameLastFirst(r.resident)}
            </Link>
          ),
        },
        { key: "purpose", header: "Purpose", cell: (r) => <span className="text-ink-secondary">{r.purpose}</span>, optional: true },
        { key: "issued", header: "Issued", cell: (r) => <Cell2 title={formatDate(r.issuedAt.toISOString())} sub={r.validUntil ? `Until ${formatDate(r.validUntil.toISOString())}` : "No expiry"} /> },
        { key: "or", header: "O.R. / fee", cell: (r) => <Cell2 title={r.orNumber ?? "No fee"} sub={Number(r.fee.toString()) > 0 ? formatPeso(Number(r.fee.toString())) : undefined} />, optional: true },
        { key: "status", header: "Status", cell: (r) => <span title={r.voidReason ?? undefined}><StatusBadge status={r.display} /></span> },
        {
          key: "actions",
          header: "",
          className: "text-right",
          cell: (r) => (
            <div className="flex justify-end gap-1">
              <Link href={`${routes.printDocument}/${r.id}`} className="btn btn-ghost btn-sm" title={r.printCount > 1 ? `Printed ${r.printCount} times` : undefined}>
                <Icon name="printer" className="h-3.5 w-3.5" /> {r.display === "Voided" ? "View" : r.printCount ? "Reprint" : "Print"}
              </Link>
              {r.display !== "Voided" && (
                <ActionDialog
                  trigger="Void"
                  triggerClassName="btn btn-ghost btn-sm text-dash-danger"
                  title={`Void ${r.controlNo}?`}
                  description="A void document cannot be printed again. It stays in the register with your reason."
                  action={voidDocument}
                  hidden={{ id: r.id }}
                  confirmLabel="Void document"
                  tone="danger"
                  icon="xCircle"
                  reason={{ label: "Reason", placeholder: "For example, wrong name entered", required: true }}
                />
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
