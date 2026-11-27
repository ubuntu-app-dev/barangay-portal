import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { PRIORITY, label, options } from "@/lib/labels";
import { flat, type SearchParams } from "@/server/params";
import { listMunicipalAnnouncements } from "@/server/queries/announcements";
import { getOffices } from "@/server/queries/submissions";
import type { Session } from "@/types/dashboard";
import { MarkAnnouncementRead } from "./ReadButtons";

export default async function MunicipalFeed({ session, sp, advisories, title, description, icon, basePath }: { session: Session; sp: SearchParams; advisories?: boolean; title: string; description: string; icon: IconName; basePath: string }) {
  const [list, offices] = await Promise.all([listMunicipalAnnouncements(session, sp, advisories), getOffices(session)]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Announcements and Communications" icon={icon} title={title} description={description} />
      <Card title={`${formatNumber(list.total)} ${advisories ? "advisor" : "announcement"}${list.total === 1 ? (advisories ? "y" : "") : advisories ? "ies" : "s"}`} icon={icon}>
        <ListToolbar
          placeholder="Search announcements"
          filters={[
            { name: "priority", label: "Priority", options: options(PRIORITY) },
            { name: "office", label: "Office", options: offices.map((o) => ({ value: o.id, label: o.acronym ? `${o.acronym}: ${o.name}` : o.name })) },
          ]}
        />
        {list.rows.length === 0 ? (
          <EmptyState icon={icon} title="Nothing here" text="Announcements from the municipal government will appear here." />
        ) : (
          <ul className="space-y-3">
            {list.rows.map((a) => (
              <li key={a.id} id={a.id} className={`scroll-mt-24 rounded-2xl border p-5 ${a.priority === "URGENT" ? "border-dash-danger/30 bg-dash-danger-soft/40" : a.read ? "border-rule/70 bg-panel" : "border-dash-primary/25 bg-dash-primary-soft/25"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-secondary">
                    {a.isPinned && (
                      <span className="inline-flex items-center gap-1 font-semibold text-dash-primary">
                        <Icon name="star" className="h-3.5 w-3.5" /> Pinned
                      </span>
                    )}
                    {a.priority !== "NORMAL" && <StatusBadge status={label(PRIORITY, a.priority)} />}
                    {a.isAdvisory && <span className="rounded-full bg-dash-gold-soft px-2 py-0.5 font-semibold text-dash-gold-ink">Advisory</span>}
                    <span>
                      {a.office?.name ?? (a.scope === "SYSTEM" ? "LGU Connect" : "Municipal Government")} · {formatDateTime(a.publishedAt.toISOString())}
                    </span>
                  </div>
                  {a.read ? <span className="text-[12px] text-ink-secondary">Read</span> : <MarkAnnouncementRead id={a.id} />}
                </div>
                <h2 className="mt-2 flex items-center gap-2 font-display text-[17px] font-bold">
                  {!a.read && <span aria-label="Unread" className="h-2 w-2 rounded-full bg-dash-primary" />}
                  {a.title}
                </h2>
                <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-secondary">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={basePath} />
      </Card>
    </div>
  );
}
