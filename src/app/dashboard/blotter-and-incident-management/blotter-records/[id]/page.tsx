import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PartyFields from "@/components/blotter/PartyFields";
import Card from "@/components/dashboard/ui/Card";
import ChangeHistory from "@/components/dashboard/ui/ChangeHistory";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { daysUntil, formatDate, formatDateTime } from "@/lib/dashboard/format";
import { BLOTTER_CATEGORIES } from "@/lib/defaults";
import { BLOTTER_KIND, BLOTTER_STATUS, HEARING_OUTCOME, KP_STAGE, PARTY_ROLE, SEX, label, options } from "@/lib/labels";
import { addHearing, addParty, archiveBlotterEntry, removeParty, setKpStage, updateBlotterDetails, updateBlotterStatus, updateHearing } from "@/server/actions/blotter";
import { str, type SearchParams } from "@/server/params";
import { getBlotterEntry, OPEN_STATUSES } from "@/server/queries/blotter";

export const metadata: Metadata = { title: "Blotter Entry" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

const local = (d: Date) => new Date(d.getTime() + 8 * 3600_000).toISOString().slice(0, 16);

async function Content({ params, searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const e = await getBlotterEntry(session, id);
  const open = (OPEN_STATUSES as readonly string[]).includes(e.status);
  const days = e.kpDeadline ? daysUntil(e.kpDeadline) : null;
  const nextStage = e.kpStage === "MEDIATION" ? "CONCILIATION" : e.kpStage === "CONCILIATION" ? "ARBITRATION" : null;
  const back = e.isVawc ? { href: routes.vawc, label: "VAWC Records" } : e.kpStage ? { href: routes.kp, label: "Katarungang Pambarangay" } : { href: routes.blotter, label: "Blotter Records" };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader back={back} eyebrow={`${e.kpCaseNo ? `${e.kpCaseNo} · ` : ""}${e.blotterNo} · ${label(BLOTTER_KIND, e.kind)}`} title={e.title} description={`${e.category} · ${formatDateTime(e.incidentAt.toISOString())} · ${e.location}`}>
          <PrintPageButton />
          <ActionDialog
            trigger={
              <>
                <Icon name="refresh" className="h-4 w-4" /> Update status
              </>
            }
            triggerClassName="btn btn-primary"
            title="Update status"
            description="Record what happened. Closing statuses need an outcome."
            action={updateBlotterStatus}
            hidden={{ id: e.id }}
            confirmLabel="Save status"
            icon="refresh"
          >
            <Select name="status" label="Status" options={options(BLOTTER_STATUS)} defaultValue={e.status} required />
            <Textarea name="actionTaken" label="Action taken" defaultValue={e.actionTaken ?? ""} rows={3} />
            <Textarea name="resolution" label="Outcome / resolution" defaultValue={e.resolution ?? ""} rows={3} hint="For example, both parties signed an amicable settlement." />
          </ActionDialog>
        </PageHeader>
      </div>
      <SavedNotice value={str(sp.saved)} />
      {e.isVawc && (
        <p className="flex items-start gap-2.5 rounded-xl border border-dash-danger/20 bg-dash-danger-soft px-4 py-3 text-[14px] text-dash-danger">
          <Icon name="lock" className="mt-0.5 h-4 w-4" /> Confidential VAWC record (RA 9262). Handle and share only with the proper authorities.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card
            title="Narrative"
            icon="clipboard"
            actions={
              <>
                <StatusBadge status={label(BLOTTER_STATUS, e.status)} />
                <ActionDialog trigger={<Icon name="edit" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 no-print" title="Correct the details" description="Corrections are logged with the old and new values." action={updateBlotterDetails} hidden={{ id: e.id }} confirmLabel="Save corrections" icon="edit">
                  <Input name="title" label="Title" defaultValue={e.title} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select name="category" label="Category" options={[...new Set([...BLOTTER_CATEGORIES, e.category])].map((c) => ({ value: c, label: c }))} defaultValue={e.category} required />
                    <Input name="incidentAt" label="Date and time" type="datetime-local" defaultValue={local(e.incidentAt)} required />
                  </div>
                  <Input name="location" label="Where" defaultValue={e.location} required />
                  <Textarea name="narrative" label="Narrative" defaultValue={e.narrative} rows={6} required />
                </ActionDialog>
              </>
            }
          >
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{e.narrative}</p>
            <div className="mt-5 grid gap-4 border-t border-rule pt-4 sm:grid-cols-2">
              <DetailList columns={1} rows={[["Action taken", e.actionTaken]]} />
              <DetailList columns={1} rows={[["Outcome", e.resolution ? `${e.resolution}${e.resolvedAt ? ` (${formatDate(e.resolvedAt.toISOString())})` : ""}` : null]]} />
            </div>
          </Card>

          <Card
            title="People Involved"
            icon="users"
            actions={
              <ActionDialog trigger={<><Icon name="plus" className="h-4 w-4" /> Add person</>} triggerClassName="btn btn-soft btn-sm no-print" title="Add a person to this entry" action={addParty} hidden={{ id: e.id }} confirmLabel="Add person" icon="userPlus">
                <Select name="role" label="Role" options={options(PARTY_ROLE)} defaultValue="WITNESS" required />
                <PartyFields prefix="party" label="Person" required />
                <Textarea name="statement" label="Statement" rows={3} />
              </ActionDialog>
            }
          >
            {e.parties.length === 0 ? (
              <EmptyState icon="users" title="No one recorded" text="Add the complainant, respondent, and witnesses." />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {e.parties.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-rule/80 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${p.role === "RESPONDENT" ? "bg-dash-danger-soft text-dash-danger" : p.role === "WITNESS" ? "bg-ground-muted text-ink-secondary" : "bg-dash-primary-soft text-dash-primary"}`}>{label(PARTY_ROLE, p.role)}</span>
                        <p className="mt-2 font-semibold">
                          {p.resident ? (
                            <Link href={`${routes.residents}/${p.resident.id}`} className="hover:text-dash-primary hover:underline">
                              {p.name}
                            </Link>
                          ) : (
                            p.name
                          )}
                        </p>
                        <p className="text-[12.5px] text-ink-secondary">{[p.age ? `${p.age} yrs` : null, p.sex ? label(SEX, p.sex) : null, p.contact, p.resident ? p.resident.residentNo : "Not a resident"].filter(Boolean).join(" · ")}</p>
                        {p.address && <p className="text-[12.5px] text-ink-secondary">{p.address}</p>}
                      </div>
                      <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger no-print" title={`Remove ${p.name}?`} action={removeParty} hidden={{ partyId: p.id }} confirmLabel="Remove" tone="danger" icon="trash" />
                    </div>
                    {p.statement && <p className="mt-3 whitespace-pre-line border-t border-rule/70 pt-2 text-[13.5px] italic text-ink-secondary">&ldquo;{p.statement}&rdquo;</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Hearings"
            icon="calendar"
            actions={
              <ActionDialog trigger={<><Icon name="plus" className="h-4 w-4" /> Schedule</>} triggerClassName="btn btn-soft btn-sm no-print" title="Schedule a hearing" action={addHearing} hidden={{ id: e.id }} confirmLabel="Schedule" icon="calendar">
                <Select name="stage" label="Stage" options={options(KP_STAGE)} defaultValue={e.kpStage ?? "MEDIATION"} required />
                <Input name="scheduledAt" label="Date and time" type="datetime-local" required />
                <Textarea name="notes" label="Notes" rows={2} placeholder="Summons served to both parties" />
              </ActionDialog>
            }
          >
            {e.hearings.length === 0 ? (
              <EmptyState icon="calendar" title="No hearings yet" text="Schedule mediation or conciliation hearings here." />
            ) : (
              <ol className="space-y-3">
                {e.hearings.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-rule/80 p-4">
                    <div>
                      <p className="font-semibold">{formatDateTime(h.scheduledAt.toISOString())}</p>
                      <p className="text-[12.5px] text-ink-secondary">{label(KP_STAGE, h.stage)} hearing</p>
                      {h.notes && <p className="mt-1 text-[13.5px] text-ink-secondary">{h.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={label(HEARING_OUTCOME, h.outcome)} />
                      <ActionDialog trigger="Record outcome" triggerClassName="btn btn-ghost btn-sm no-print" title="Hearing outcome" action={updateHearing} hidden={{ hearingId: h.id }} confirmLabel="Save" icon="checkCircle">
                        <Select name="outcome" label="Outcome" options={options(HEARING_OUTCOME)} defaultValue={h.outcome} required />
                        <Textarea name="notes" label="Notes" defaultValue={h.notes ?? ""} rows={3} />
                      </ActionDialog>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {!e.isVawc && (
            <Card title="Katarungang Pambarangay" icon="scale">
              {e.kpStage ? (
                <div className="space-y-4">
                  <DetailList
                    columns={1}
                    rows={[
                      ["Case no.", e.kpCaseNo],
                      ["Stage", label(KP_STAGE, e.kpStage)],
                      ["Filed", e.kpFiledAt ? formatDate(e.kpFiledAt.toISOString()) : null],
                    ]}
                  />
                  {e.kpDeadline && (
                    <div className={`rounded-xl px-4 py-3 ${!open ? "bg-ground-muted" : days !== null && days < 0 ? "bg-dash-danger-soft text-dash-danger" : days !== null && days <= 3 ? "bg-dash-gold-soft text-dash-gold-ink" : "bg-dash-primary-soft text-dash-primary"}`}>
                      <p className="text-[12px] font-semibold uppercase tracking-wide">Deadline</p>
                      <p className="font-display text-[18px] font-bold">{formatDate(e.kpDeadline.toISOString())}</p>
                      {open && days !== null && <p className="text-[13px] font-medium">{days < 0 ? `${Math.abs(days)} days past the period` : days === 0 ? "Due today" : `${days} days left`}</p>}
                    </div>
                  )}
                  {open && (
                    <div className="no-print flex flex-wrap gap-2">
                      {nextStage && (
                        <ActionDialog trigger={`Move to ${label(KP_STAGE, nextStage).toLowerCase()}`} triggerClassName="btn btn-soft btn-sm" title={`Move to ${label(KP_STAGE, nextStage).toLowerCase()}?`} description={nextStage === "CONCILIATION" ? "Mediation failed: the case goes to the Pangkat ng Tagapagkasundo, with a new 15-day period." : "Both parties agreed in writing to arbitration."} action={setKpStage} hidden={{ id: e.id, stage: nextStage }} confirmLabel="Move" icon="scale" />
                      )}
                      {e.kpStage === "CONCILIATION" && (
                        <ActionDialog trigger="Extend 15 days" triggerClassName="btn btn-ghost btn-sm" title="Extend the conciliation period?" description="The Pangkat may extend once, by up to 15 days." action={setKpStage} hidden={{ id: e.id, stage: "CONCILIATION", extend: "on" }} confirmLabel="Extend" icon="clock" />
                      )}
                    </div>
                  )}
                </div>
              ) : open ? (
                <div className="space-y-3">
                  <p className="text-[14px] text-ink-secondary">Disputes between residents of the same city or municipality go through barangay conciliation before court.</p>
                  <ActionDialog trigger="File as a KP case" triggerClassName="btn btn-primary btn-sm no-print" title="File as a Katarungang Pambarangay case" description="Starts the 15-day mediation period before the Punong Barangay. A KP case number is assigned." action={setKpStage} hidden={{ id: e.id, stage: "MEDIATION" }} confirmLabel="File case" icon="scale" />
                </div>
              ) : (
                <p className="text-[14px] text-ink-secondary">Not a KP case.</p>
              )}
            </Card>
          )}
          <Card title="Record" icon="info">
            <DetailList
              columns={1}
              rows={[
                ["Blotter no.", e.blotterNo],
                ["Type", label(BLOTTER_KIND, e.kind)],
                ["Category", e.category],
                ["Purok", e.purok?.name],
                ["Recorded", formatDateTime(e.createdAt.toISOString())],
              ]}
            />
          </Card>
          <Card title="Change History" icon="history" className="no-print">
            <ChangeHistory rows={e.history} />
          </Card>
          <div className="surface no-print p-5">
            <p className="font-display text-[15px] font-bold">Entered by mistake?</p>
            <p className="mt-1 text-[13px] text-ink-secondary">Archive it. It disappears from lists but stays in the audit log.</p>
            <div className="mt-3">
              <ActionDialog trigger="Archive entry" triggerClassName="btn btn-secondary btn-sm text-dash-danger" title={`Archive ${e.blotterNo}?`} action={archiveBlotterEntry} hidden={{ id: e.id }} confirmLabel="Archive" tone="danger" icon="archive" reason={{ label: "Reason", required: true }} />
            </div>
          </div>
        </div>
      </div>
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
