import Link from "next/link";
import type { ReactNode } from "react";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import ListToolbar, { type FilterDef } from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2, RowLink } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { daysUntil, formatDate, formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { BLOTTER_KIND, BLOTTER_STATUS, KP_STAGE, label, options } from "@/lib/labels";
import { flat, str, type SearchParams } from "@/server/params";
import { blotterCategories, blotterSummary, canSeeVawc, listBlotter, type BlotterScope } from "@/server/queries/blotter";
import type { Session } from "@/types/dashboard";

type Props = {
  session: Session;
  sp: SearchParams;
  scope: BlotterScope;
  title: string;
  description: string;
  icon: IconName;
  basePath: string;
  newHref?: string;
  newLabel?: string;
  showDeadline?: boolean;
  intro?: ReactNode;
};

function DeadlineCell({ deadline, open }: { deadline: Date | null; open: boolean }) {
  if (!deadline) return <span className="text-ink-secondary">—</span>;
  const days = daysUntil(deadline);
  const tone = !open ? "text-ink-secondary" : days < 0 ? "font-semibold text-dash-danger" : days <= 3 ? "font-semibold text-dash-gold-ink" : "";
  return (
    <Cell2
      title={<span className={tone}>{formatDate(deadline.toISOString())}</span>}
      sub={open ? (days < 0 ? `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue` : days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} left`) : undefined}
    />
  );
}

export default async function BlotterList({ session, sp, scope, title, description, icon, basePath, newHref, newLabel, showDeadline, intro }: Props) {
  const [list, sum, categories] = await Promise.all([listBlotter(session, sp, scope), blotterSummary(session, scope), blotterCategories(session)]);
  const filters: FilterDef[] = [
    ...(scope.kind ? [] : [{ name: "kind", label: "Type", options: options(BLOTTER_KIND) }]),
    { name: "status", label: "Status", options: options(BLOTTER_STATUS) },
    ...(scope.kp || scope.open ? [{ name: "stage", label: "KP stage", options: options(KP_STAGE) }] : []),
    { name: "category", label: "Category", options: categories.map((c) => ({ value: c, label: c })) },
  ];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={scope.vawc ? "Confidential" : "Blotter and Incidents"} icon={icon} title={title} description={description}>
        {!scope.vawc && (
          <a href={`/api/dashboard/export/blotter?${new URLSearchParams({ ...(flat(sp) as Record<string, string>), ...(scope.kind ? { kind: scope.kind } : {}) })}`} className="btn btn-secondary">
            <Icon name="download" className="h-4 w-4" /> Export CSV
          </a>
        )}
        {newHref && (
          <Link href={newHref} className="btn btn-primary">
            <Icon name="plus" className="h-4 w-4" /> {newLabel ?? "New entry"}
          </Link>
        )}
      </PageHeader>
      {scope.vawc && (
        <p className="flex items-start gap-2.5 rounded-xl border border-dash-danger/20 bg-dash-danger-soft px-4 py-3 text-[14px] text-dash-danger">
          <Icon name="lock" className="mt-0.5 h-4 w-4" />
          These records are confidential under RA 9262. Do not share names or details outside the VAW desk and the proper authorities.
        </p>
      )}
      <SavedNotice value={str(sp.saved)} />
      {intro}
      {!intro && <StatTiles
        tiles={[
          { icon: "alert", label: "Open", value: formatNumber(sum.open), tone: "gold" },
          { icon: "calendar", label: "Recorded this month", value: formatNumber(sum.month), tone: "primary" },
          { icon: "checkCircle", label: "Settled or closed", value: formatNumber(sum.settled), tone: "success" },
          scope.vawc
            ? { icon: "lock", label: "Total confidential", value: formatNumber(list.total), tone: "secondary" }
            : { icon: "scale", label: sum.overdue ? `KP cases · ${sum.overdue} past deadline` : "Active KP cases", value: formatNumber(sum.kp), tone: sum.overdue ? "danger" : "secondary", href: routes.kp },
        ]}
      />}
      <Card title={`${formatNumber(list.total)} entr${list.total === 1 ? "y" : "ies"}`} icon={icon}>
        <ListToolbar placeholder="Search blotter no., title, place, or person" filters={filters} />
        {list.rows.length === 0 ? (
          <EmptyState icon={icon} title="Nothing found" text="Try a different search or clear the filters." />
        ) : (
          <Table
            caption={title}
            rows={list.rows}
            rowKey={(r) => r.id}
            cols={[
              { key: "no", header: "Entry", cell: (r) => <Cell2 title={r.title} sub={`${r.kpCaseNo ? `${r.kpCaseNo} · ` : ""}${r.blotterNo} · ${r.category}`} href={`${routes.blotter}/${r.id}`} /> },
              {
                key: "parties",
                header: "Parties",
                cell: (r) => {
                  const c = r.parties.find((p) => p.role === "COMPLAINANT" || p.role === "VICTIM");
                  const x = r.parties.find((p) => p.role === "RESPONDENT");
                  return <Cell2 title={c?.name ?? "—"} sub={x ? `vs. ${x.name}` : undefined} />;
                },
                optional: true,
              },
              { key: "when", header: "When", cell: (r) => <span className="whitespace-nowrap">{formatDateTime(r.incidentAt.toISOString())}</span>, optional: true },
              ...(showDeadline ? [{ key: "deadline", header: "Deadline", cell: (r: (typeof list.rows)[number]) => <DeadlineCell deadline={r.kpDeadline} open={["OPEN", "UNDER_MEDIATION", "UNDER_CONCILIATION", "UNDER_ARBITRATION"].includes(r.status)} /> }] : []),
              {
                key: "status",
                header: "Status",
                cell: (r) => (
                  <div className="space-y-1">
                    <StatusBadge status={label(BLOTTER_STATUS, r.status)} />
                    {!scope.kind && <p className="text-[12px] text-ink-secondary">{label(BLOTTER_KIND, r.kind)}</p>}
                  </div>
                ),
              },
              { key: "go", header: "", className: "text-right", cell: (r) => <RowLink href={`${routes.blotter}/${r.id}`} /> },
            ]}
          />
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={basePath} />
      </Card>
      {!scope.vawc && canSeeVawc(session) && (
        <p className="text-[12.5px] text-ink-secondary">
          VAWC entries are kept separately under{" "}
          <Link href={routes.vawc} className="font-semibold text-dash-primary hover:underline">
            VAWC Records
          </Link>
          .
        </p>
      )}
    </div>
  );
}
