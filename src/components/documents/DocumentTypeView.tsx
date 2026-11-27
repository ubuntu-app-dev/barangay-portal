import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import { routes } from "@/config/navigation";
import { formatNumber, formatPeso } from "@/lib/dashboard/format";
import { flat, type SearchParams } from "@/server/params";
import { CERTIFICATE_PAGES, getDocumentTypes, listIssued, typeStats } from "@/server/queries/documents";
import type { Session } from "@/types/dashboard";
import DocTypeSettings from "./DocTypeSettings";
import IssuedTable from "./IssuedTable";

/** One page for each main certificate: what it needs, what it costs, and who received it. */
export default async function DocumentTypeView({ typeKey, session, sp }: { typeKey: string; session: Session; sp: SearchParams }) {
  const types = await getDocumentTypes(session, true);
  const type = types.find((t) => t.key === typeKey);
  if (!type) return <EmptyState icon="file" title="This document is not set up" text="Ask your municipal IT administrator to add it for your barangay." />;
  const [stats, list] = await Promise.all([typeStats(session), listIssued(session, sp, { typeId: type.id })]);
  const s = stats(type.id);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Document Management" icon="fileCheck" title={type.name} description={type.description}>
        <DocTypeSettings type={type} />
        {type.isActive && (
          <Link href={`${routes.issueCertificate}?type=${type.id}`} className="btn btn-primary">
            <Icon name="filePlus" className="h-4 w-4" /> Issue {type.shortName}
          </Link>
        )}
      </PageHeader>
      {!type.isActive && <p className="rounded-xl bg-dash-gold-soft px-4 py-3 text-[14px] font-medium text-dash-gold-ink">This document is turned off. Turn it on in its settings to issue it again.</p>}
      <StatTiles
        tiles={[
          { icon: "fileCheck", label: "Issued this month", value: formatNumber(s.thisMonth), tone: "primary" },
          { icon: "file", label: "Issued in total", value: formatNumber(s.total), tone: "secondary" },
          { icon: "clipboard", label: "Fee", value: formatPeso(type.fee), tone: "gold" },
          { icon: "calendar", label: "Valid for", value: type.validityMonths ? `${type.validityMonths} months` : "No expiry", tone: "success" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Requirements" icon="clipboard">
          <ul className="space-y-3">
            {type.requirements.map((r) => (
              <li key={r} className="flex gap-2.5 text-[14px]">
                <Icon name="checkCircle" className="mt-0.5 h-4 w-4 text-dash-success" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Issued Documents" icon="history" actionLabel="Full history" actionHref={routes.issuanceHistory} className="xl:col-span-2">
          <ListToolbar
            placeholder="Search control no., resident, or O.R."
            filters={[
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
          <IssuedTable rows={list.rows} showType={false} />
          <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={`/dashboard/document-management/${CERTIFICATE_PAGES[type.key]}`} />
        </Card>
      </div>
    </div>
  );
}
