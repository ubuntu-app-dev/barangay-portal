import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { routes } from "@/config/navigation";
import { formatNumber, formatPeso } from "@/lib/dashboard/format";
import { flat, type SearchParams } from "@/server/params";
import { getDocumentTypes, listIssued, typeStats } from "@/server/queries/documents";
import type { Session } from "@/types/dashboard";
import DocTypeSettings from "./DocTypeSettings";
import IssuedTable from "./IssuedTable";

export default async function OtherDocumentsView({ session, sp }: { session: Session; sp: SearchParams }) {
  const types = await getDocumentTypes(session, true);
  const others = types.filter((t) => t.category === "other");
  const [stats, list] = await Promise.all([typeStats(session), listIssued(session, sp, { category: "OTHER" })]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Document Management" icon="file" title="Other Barangay Documents" description="Business clearances, IDs, permits, and other documents the barangay issues." />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {others.map((t) => (
          <li key={t.id} className={`surface flex flex-col p-5 ${t.isActive ? "" : "opacity-70"}`}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-[-0.01em]">{t.name}</h2>
              {!t.isActive && <span className="rounded-full bg-ground-muted px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">Off</span>}
            </div>
            <p className="mt-1 flex-1 text-[13px] text-ink-secondary">{t.description}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-rule pt-3 text-center text-[12px]">
              <div>
                <dt className="text-ink-secondary">Fee</dt>
                <dd className="font-semibold">{formatPeso(t.fee)}</dd>
              </div>
              <div>
                <dt className="text-ink-secondary">Valid</dt>
                <dd className="font-semibold">{t.validityMonths ? `${t.validityMonths} mo` : "No expiry"}</dd>
              </div>
              <div>
                <dt className="text-ink-secondary">This month</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(stats(t.id).thisMonth)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between gap-2">
              <DocTypeSettings type={t} compact />
              {t.isActive && (
                <Link href={`${routes.issueCertificate}?type=${t.id}`} className="btn btn-soft btn-sm">
                  Issue <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Card title="Issued Documents" icon="history" actionLabel="Full history" actionHref={routes.issuanceHistory}>
        <ListToolbar placeholder="Search control no., resident, or O.R." filters={[{ name: "type", label: "Document", options: others.map((t) => ({ value: t.id, label: t.name })) }]} />
        <IssuedTable rows={list.rows} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath="/dashboard/document-management/other-barangay-documents" />
      </Card>
    </div>
  );
}
