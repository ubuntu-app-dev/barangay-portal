import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { Checkbox, Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { requireRole } from "@/lib/auth/staff";
import { formatDate, formatDateTime, formatNumber, isoDay } from "@/lib/dashboard/format";
import { PRIORITY, label, options } from "@/lib/labels";
import { deleteMunicipalAnnouncement, saveMunicipalAnnouncement } from "@/server/actions/municipal";
import { db } from "@/server/db";
import { flat, type SearchParams } from "@/server/params";
import { listMunicipalPosts } from "@/server/queries/municipal";

export const metadata: Metadata = { title: "Announcements and Advisories" };

type Props = { searchParams: Promise<SearchParams> };
type Row = Awaited<ReturnType<typeof listMunicipalPosts>>["rows"][number];
const STATUS = { PUBLISHED: "Published", DRAFT: "Draft", ARCHIVED: "Archived" };

function PostDialog({ a, offices, defaultOffice }: { a?: Row; offices: { id: string; name: string }[]; defaultOffice?: string }) {
  return (
    <ActionDialog
      trigger={a ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> New announcement</>}
      triggerClassName={a ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={a ? "Edit announcement" : "Announce to every barangay"}
      description="Published announcements notify every barangay secretary (unless they turned these off)."
      action={saveMunicipalAnnouncement}
      hidden={a ? { id: a.id } : undefined}
      confirmLabel={a ? "Save" : "Publish"}
      icon="megaphone"
    >
      <Input name="title" label="Title" defaultValue={a?.title} required />
      <Textarea name="body" label="Message" defaultValue={a?.body} rows={6} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="officeId" label="From" options={offices.map((o) => ({ value: o.id, label: o.name }))} defaultValue={a?.officeId ?? defaultOffice ?? ""} placeholder="Municipal Government" />
        <Select name="priority" label="Priority" options={options(PRIORITY)} defaultValue={a?.priority ?? "NORMAL"} required />
        <Select name="status" label="Status" options={options(STATUS)} defaultValue={a?.status ?? "PUBLISHED"} required />
        <Input name="expiresAt" label="Show until" type="date" defaultValue={isoDay(a?.expiresAt)} />
      </div>
      <Checkbox name="isAdvisory" label="Advisory" hint="Health, disaster, or safety notice that needs action. Shown under Important Advisories." defaultChecked={a?.isAdvisory} />
      <Checkbox name="isPinned" label="Pin to the top" defaultChecked={a?.isPinned} />
    </ActionDialog>
  );
}

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const sp = await searchParams;
  const [list, offices] = await Promise.all([listMunicipalPosts(u, sp), db.municipalOffice.findMany({ where: { municipalityCode: u.municipality!.code, isActive: true }, orderBy: { name: "asc" } })]);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipality" icon="megaphone" title="Announcements and Advisories" description="Messages to every barangay of the municipality, with how many secretaries have read each one.">
        <PostDialog offices={offices} defaultOffice={u.office?.id} />
      </PageHeader>
      <Card title={`${formatNumber(list.total)} announcement${list.total === 1 ? "" : "s"}`} icon="megaphone">
        <ListToolbar placeholder="Search announcements" />
        {list.rows.length === 0 ? (
          <EmptyState icon="megaphone" title="No announcements yet" text="Post one to reach every barangay secretary." />
        ) : (
          <ul className="space-y-3">
            {list.rows.map((a) => {
              const expired = a.expiresAt && a.expiresAt < new Date();
              return (
                <li key={a.id} className="rounded-2xl border border-rule/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-secondary">
                      {a.isPinned && <span className="inline-flex items-center gap-1 font-semibold text-dash-primary"><Icon name="star" className="h-3.5 w-3.5" /> Pinned</span>}
                      <StatusBadge status={expired ? "Expired" : STATUS[a.status]} />
                      {a.priority !== "NORMAL" && <StatusBadge status={label(PRIORITY, a.priority)} />}
                      {a.isAdvisory && <span className="rounded-full bg-dash-gold-soft px-2 py-0.5 font-semibold text-dash-gold-ink">Advisory</span>}
                      <span>
                        {a.office?.name ?? "Municipal Government"} · {formatDateTime(a.publishedAt.toISOString())}
                        {a.expiresAt && ` · until ${formatDate(a.expiresAt.toISOString())}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {a.status === "PUBLISHED" && (
                        <span className="mr-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-secondary">
                          <Icon name="eye" className="h-3.5 w-3.5" /> Read by {a._count.reads} of {list.secretaries}
                        </span>
                      )}
                      <PostDialog a={a} offices={offices} />
                      <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger" title={`Delete "${a.title}"?`} action={deleteMunicipalAnnouncement} hidden={{ id: a.id }} confirmLabel="Delete" tone="danger" icon="trash" />
                    </div>
                  </div>
                  <h2 className="mt-2 font-display text-[17px] font-bold">{a.title}</h2>
                  <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-secondary">{a.body}</p>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath="/municipal/announcements" />
      </Card>
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
