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
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatDate, formatDateTime, formatNumber, isoDay } from "@/lib/dashboard/format";
import { PRIORITY, label, options } from "@/lib/labels";
import { deleteBarangayAnnouncement, saveBarangayAnnouncement } from "@/server/actions/announcements";
import { flat, type SearchParams } from "@/server/params";
import { listBarangayAnnouncements } from "@/server/queries/announcements";

export const metadata: Metadata = { title: "Barangay Announcements" };

type Props = { searchParams: Promise<SearchParams> };
type Row = Awaited<ReturnType<typeof listBarangayAnnouncements>>["rows"][number];

const STATUS = { PUBLISHED: "Published", DRAFT: "Draft", ARCHIVED: "Archived" };

function AnnouncementDialog({ a }: { a?: Row }) {
  return (
    <ActionDialog
      trigger={a ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> New announcement</>}
      triggerClassName={a ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={a ? "Edit announcement" : "New barangay announcement"}
      description="For residents and barangay staff: schedules, activities, and reminders."
      action={saveBarangayAnnouncement}
      hidden={a ? { id: a.id } : undefined}
      confirmLabel={a ? "Save" : "Post"}
      icon="megaphone"
    >
      <Input name="title" label="Title" defaultValue={a?.title} required />
      <Textarea name="body" label="Message" defaultValue={a?.body} rows={6} required />
      <div className="grid gap-4 sm:grid-cols-3">
        <Select name="priority" label="Priority" options={options(PRIORITY)} defaultValue={a?.priority ?? "NORMAL"} required />
        <Select name="status" label="Status" options={options(STATUS)} defaultValue={a?.status ?? "PUBLISHED"} required />
        <Input name="expiresAt" label="Show until" type="date" defaultValue={isoDay(a?.expiresAt)} />
      </div>
      <Checkbox name="isPinned" label="Pin to the top" defaultChecked={a?.isPinned} />
    </ActionDialog>
  );
}

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const list = await listBarangayAnnouncements(session, sp);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Announcements and Communications" icon="megaphone" title="Barangay Announcements" description="Announcements your barangay posts for its residents.">
        <AnnouncementDialog />
      </PageHeader>
      <Card title={`${formatNumber(list.total)} announcement${list.total === 1 ? "" : "s"}`} icon="megaphone">
        <ListToolbar placeholder="Search announcements" />
        {list.rows.length === 0 ? (
          <EmptyState icon="megaphone" title="No announcements yet" text="Post schedules, activities, and reminders for residents." />
        ) : (
          <ul className="space-y-3">
            {list.rows.map((a) => {
              const expired = a.expiresAt && a.expiresAt < new Date();
              return (
                <li key={a.id} className="rounded-2xl border border-rule/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-secondary">
                      {a.isPinned && (
                        <span className="inline-flex items-center gap-1 font-semibold text-dash-primary">
                          <Icon name="star" className="h-3.5 w-3.5" /> Pinned
                        </span>
                      )}
                      <StatusBadge status={expired ? "Expired" : STATUS[a.status]} />
                      {a.priority !== "NORMAL" && <StatusBadge status={label(PRIORITY, a.priority)} />}
                      <span>{formatDateTime(a.publishedAt.toISOString())}</span>
                      {a.expiresAt && <span>· until {formatDate(a.expiresAt.toISOString())}</span>}
                    </div>
                    <div className="flex gap-1">
                      <AnnouncementDialog a={a} />
                      <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger" title={`Delete "${a.title}"?`} action={deleteBarangayAnnouncement} hidden={{ id: a.id }} confirmLabel="Delete" tone="danger" icon="trash" />
                    </div>
                  </div>
                  <h2 className="mt-2 font-display text-[17px] font-bold">{a.title}</h2>
                  <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-secondary">{a.body}</p>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={routes.barangayAnnouncements} />
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
