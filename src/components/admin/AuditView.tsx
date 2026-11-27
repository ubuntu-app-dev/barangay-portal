import Card from "@/components/dashboard/ui/Card";
import ListToolbar, { type FilterDef } from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import type { StaffSession } from "@/lib/auth/staff";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { AUDIT_ACTION, label, options } from "@/lib/labels";
import { db } from "@/server/db";
import { flat, type SearchParams } from "@/server/params";
import { listAudit } from "@/server/queries/admin";

/** Read-only audit log. Nobody can edit or delete entries from the app. */
export default async function AuditView({ u, sp, base }: { u: StaffSession; sp: SearchParams; base: string }) {
  const superadmin = u.role === "SUPERADMIN";
  const [list, places] = await Promise.all([
    listAudit(u, sp),
    superadmin ? db.municipality.findMany({ orderBy: { name: "asc" } }) : db.barangay.findMany({ where: { municipalityCode: u.municipality!.code }, orderBy: { name: "asc" } }),
  ]);
  const filters: FilterDef[] = [
    { name: "action", label: "Action", options: options(AUDIT_ACTION) },
    superadmin
      ? { name: "municipality", label: "Municipality", options: places.map((p) => ({ value: p.code, label: p.name })) }
      : { name: "barangay", label: "Barangay", options: places.map((p) => ({ value: p.code, label: p.name })) },
    ...(!superadmin ? [{ name: "scope", label: "Source", options: [{ value: "municipal", label: "Municipal staff only" }] }] : []),
  ];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Security" icon="history" title="Audit Log" description={`Sign-ins, failed attempts, exports, and every record change${superadmin ? " across the system" : " in the municipality"}. Entries cannot be edited or deleted.`} />
      <Card title={`${formatNumber(list.total)} entr${list.total === 1 ? "y" : "ies"}`} icon="history">
        <ListToolbar placeholder="Search what happened, who, or IP address" filters={filters} />
        <Table
          caption="Audit log"
          rows={list.rows}
          rowKey={(r) => r.id}
          cols={[
            { key: "t", header: "When", cell: (r) => <span className="whitespace-nowrap text-[13px]">{formatDateTime(r.createdAt.toISOString())}</span> },
            { key: "a", header: "Who", cell: (r) => <Cell2 title={r.actorName} sub={r.ip ?? undefined} /> },
            { key: "x", header: "Action", cell: (r) => <StatusBadge status={r.action === "LOGIN_FAILED" ? "Failed" : label(AUDIT_ACTION, r.action)} /> },
            { key: "s", header: "What", cell: (r) => <span className="text-[13.5px]">{r.summary}</span> },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={base} />
      </Card>
    </div>
  );
}
