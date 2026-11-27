import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import { routes } from "@/config/navigation";
import { formatNumber } from "@/lib/dashboard/format";
import { flat, type SearchParams } from "@/server/params";
import { getDocumentTypes, listIssued, typeStats } from "@/server/queries/documents";
import type { Session } from "@/types/dashboard";
import IssuedTable from "./IssuedTable";

/** Last 12 months, for the month filter. */
function months() {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ value: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`, label: m.toLocaleString("en-PH", { month: "long", year: "numeric" }) });
  }
  return out;
}

export default async function HistoryView({ session, sp }: { session: Session; sp: SearchParams }) {
  const [types, stats, list] = await Promise.all([getDocumentTypes(session, true), typeStats(session), listIssued(session, sp)]);
  const per = types.map((t) => ({ t, ...stats(t.id) }));
  const month = per.reduce((s, x) => s + x.thisMonth, 0);
  const total = per.reduce((s, x) => s + x.total, 0);
  const top = [...per].sort((a, b) => b.total - a.total)[0];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Document Management" icon="history" title="Issuance History" description="Every document the barangay has issued. Voided documents stay in the list: records are never deleted.">
        <a href={`/api/dashboard/export/issued?${new URLSearchParams(flat(sp) as Record<string, string>)}`} className="btn btn-secondary">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
      </PageHeader>
      <StatTiles
        columns={3}
        tiles={[
          { icon: "fileCheck", label: "Issued this month", value: formatNumber(month), tone: "primary" },
          { icon: "file", label: "Issued in total", value: formatNumber(total), tone: "secondary" },
          { icon: "star", label: "Most issued", value: formatNumber(top?.total ?? 0), hint: top?.t.name, tone: "gold" },
        ]}
      />
      <Card title="Issued Documents" icon="fileCheck">
        <ListToolbar
          placeholder="Search control no., resident, purpose, or O.R."
          filters={[
            { name: "type", label: "Document", options: types.map((t) => ({ value: t.id, label: t.name })) },
            { name: "month", label: "Month", options: months() },
            {
              name: "status",
              label: "Status",
              options: [
                { value: "valid", label: "Valid" },
                { value: "expired", label: "Expired" },
                { value: "voided", label: "Voided" },
              ],
            },
          ]}
        />
        <IssuedTable rows={list.rows} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={routes.issuanceHistory} />
      </Card>
    </div>
  );
}
