import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ChangeHistory from "@/components/dashboard/ui/ChangeHistory";
import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { ageOf, formatDate, nameFull } from "@/lib/dashboard/format";
import { BLOTTER_STATUS, CIVIL_STATUS, EDUCATION, PARTY_ROLE, RELATIONSHIP, REQUEST_STATUS, RESIDENT_STATUS, SEX, SPECIES, label } from "@/lib/labels";
import { archiveResident } from "@/server/actions/residents";
import { str, type SearchParams } from "@/server/params";
import { getResident } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Resident" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

async function Content({ params, searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const r = await getResident(session, id);
  const age = ageOf(r.birthDate);
  const tags = [
    r.isRegisteredVoter && "Registered voter",
    age >= 60 && "Senior citizen",
    r.isPwd && "PWD",
    r.isSoloParent && "Solo parent",
    r.is4Ps && "4Ps beneficiary",
    r.isOutOfSchoolYouth && "Out-of-school youth",
    r.isOfw && "OFW",
    r.isIndigenous && "Indigenous",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <PageHeader back={{ href: routes.residents, label: "Resident Records" }} title={nameFull(r)} description={`${r.residentNo} · ${age} years old · ${label(SEX, r.sex)} · ${r.purok?.name ?? "No purok"}`}>
        <Link href={`${routes.issueCertificate}?resident=${r.id}`} className="btn btn-secondary">
          <Icon name="fileCheck" className="h-4 w-4" /> Issue document
        </Link>
        <Link href={`${routes.residents}/${r.id}/edit`} className="btn btn-primary">
          <Icon name="edit" className="h-4 w-4" /> Edit
        </Link>
      </PageHeader>
      <SavedNotice value={str(sp.saved)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Personal Information" icon="user" actions={r.status !== "ACTIVE" ? <StatusBadge status={label(RESIDENT_STATUS, r.status)} /> : undefined}>
            <DetailList
              columns={3}
              rows={[
                ["Full name", nameFull(r)],
                ["Sex", label(SEX, r.sex)],
                ["Birth date", `${formatDate(r.birthDate.toISOString())} (${age})`],
                ["Birth place", r.birthPlace],
                ["Civil status", label(CIVIL_STATUS, r.civilStatus)],
                ["Citizenship", r.citizenship],
                ["Religion", r.religion],
                ["Education", label(EDUCATION, r.education)],
                ["Occupation", r.occupation],
                ["Mobile", r.contactNumber],
                ["Email", r.email],
                ["PhilSys number", r.philsysNo ? `•••• ${r.philsysNo.slice(-4)}` : null],
              ]}
            />
          </Card>
          <Card title="Address and Household" icon="home">
            <DetailList
              columns={3}
              rows={[
                ["Address", r.address],
                ["Purok", r.purok?.name],
                ["Resident since", r.residentSince ? String(r.residentSince) : null],
                [
                  "Household",
                  r.household ? (
                    <Link href={`${routes.households}/${r.household.id}`} className="text-dash-primary hover:underline">
                      {r.household.householdNo}
                    </Link>
                  ) : null,
                ],
                ["Relationship to head", label(RELATIONSHIP, r.relationship)],
                ["Family", r.family?.name],
              ]}
            />
            {r.household && r.household.members.length > 1 && (
              <div className="mt-5 border-t border-rule pt-4">
                <p className="mb-2 text-[13px] font-semibold text-ink-secondary">Household members</p>
                <ul className="flex flex-wrap gap-2">
                  {r.household.members
                    .filter((m) => m.id !== r.id)
                    .map((m) => (
                      <li key={m.id}>
                        <Link href={`${routes.residents}/${m.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1 text-[13px] hover:border-dash-primary hover:text-dash-primary">
                          {m.firstName} {m.lastName}
                          <span className="text-ink-secondary">· {label(RELATIONSHIP, m.relationship) || "Member"}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Card>
          <Card title="Documents" icon="fileCheck" actionLabel="Issue document" actionHref={`${routes.issueCertificate}?resident=${r.id}`}>
            {r.requests.length > 0 && (
              <ul className="mb-4 space-y-2">
                {r.requests.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-3 rounded-xl bg-dash-gold-soft/60 px-4 py-2.5 text-[14px]">
                    <span>
                      <strong>{q.documentType.name}</strong> requested {formatDate(q.requestedAt.toISOString())}
                    </span>
                    <StatusBadge status={label(REQUEST_STATUS, q.status)} />
                  </li>
                ))}
              </ul>
            )}
            {r.issued.length === 0 ? (
              <EmptyState icon="file" title="No documents yet" text="Certificates issued to this resident will be listed here." />
            ) : (
              <ul className="divide-y divide-rule/80">
                {r.issued.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span>
                      <Link href={`${routes.printDocument}/${d.id}`} className="font-semibold hover:text-dash-primary hover:underline">
                        {d.documentType.name}
                      </Link>
                      <span className="block text-[12.5px] text-ink-secondary">
                        {d.controlNo} · {d.purpose} · {formatDate(d.issuedAt.toISOString())}
                      </span>
                    </span>
                    <StatusBadge status={d.status === "VOIDED" ? "Voided" : d.validUntil && d.validUntil < new Date() ? "Expired" : "Valid"} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Classification" icon="layers">
            {tags.length === 0 ? (
              <p className="text-[14px] text-ink-secondary">No special classification.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t} className="rounded-full bg-dash-primary-soft px-3 py-1 text-[13px] font-semibold text-dash-primary">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <DetailList
              columns={1}
              rows={[
                ...(r.isRegisteredVoter ? ([["Precinct", r.voterPrecinct]] as [string, string | null][]) : []),
                ...(r.isPwd ? ([["Disability", r.disability]] as [string, string | null][]) : []),
                ...(r.seniorIdNo ? ([["OSCA ID", r.seniorIdNo]] as [string, string | null][]) : []),
              ]}
            />
          </Card>
          {r.blotterParties.length > 0 && (
            <Card title="Blotter Involvement" icon="shield">
              <ul className="space-y-2">
                {r.blotterParties.map((p) => (
                  <li key={p.id}>
                    <Link href={`${routes.blotter}/${p.entry.id}`} className="block rounded-xl border border-rule px-3 py-2.5 hover:border-dash-primary/40">
                      <span className="block text-[14px] font-semibold">{p.entry.title}</span>
                      <span className="text-[12.5px] text-ink-secondary">
                        {label(PARTY_ROLE, p.role)} · {p.entry.blotterNo} · {label(BLOTTER_STATUS, p.entry.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {r.animals.length > 0 && (
            <Card title="Animals" icon="paw">
              <ul className="space-y-1 text-[14px]">
                {r.animals.map((a) => (
                  <li key={a.id}>
                    {a.tagNo} · {label(SPECIES, a.species)}
                    {a.name ? ` (${a.name})` : ""}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {r.remarks && (
            <Card title="Remarks" icon="info">
              <p className="whitespace-pre-line text-[14px] text-ink-secondary">{r.remarks}</p>
            </Card>
          )}
          <Card title="Change History" icon="history">
            <ChangeHistory rows={r.history} />
          </Card>
          <div className="surface border-dash-danger/20 p-5">
            <p className="font-display text-[15px] font-bold">Archive this record</p>
            <p className="mt-1 text-[13px] text-ink-secondary">For duplicates or records entered by mistake. Use &ldquo;Moved out&rdquo; or &ldquo;Deceased&rdquo; in Edit for real changes.</p>
            <div className="mt-3">
              <ActionDialog
                trigger={
                  <>
                    <Icon name="archive" className="h-4 w-4" /> Archive
                  </>
                }
                triggerClassName="btn btn-secondary btn-sm text-dash-danger"
                title="Archive this resident?"
                description={`${nameFull(r)} will leave every list and report. Issued documents and cases keep their link to this record.`}
                action={archiveResident}
                hidden={{ id: r.id }}
                confirmLabel="Archive"
                tone="danger"
                icon="archive"
                reason={{ label: "Reason", placeholder: "For example, duplicate of R-00123", required: true }}
              />
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
