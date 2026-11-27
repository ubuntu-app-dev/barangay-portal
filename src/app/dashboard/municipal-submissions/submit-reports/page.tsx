import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import { ActionForm, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ReportView from "@/components/reports/ReportView";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/dashboard/format";
import { FREQUENCY, REPORT_KIND, label, options } from "@/lib/labels";
import { submitReport } from "@/server/actions/submissions";
import { oneOf, str, type SearchParams } from "@/server/params";
import { getOffices, getRequirement, requirementsWithStatus } from "@/server/queries/submissions";
import { buildReport, PERIODS, resolvePeriod } from "@/server/reports";
import { phDayRange } from "@/server/time";
import type { ReportKindKey } from "@/types/reports";

export const metadata: Metadata = { title: "Submit Reports" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const [reqs, offices, requirement] = await Promise.all([requirementsWithStatus(session), getOffices(session), getRequirement(session, str(sp.requirement))]);
  const open = reqs.filter((r) => !r.done);
  const kind = (requirement?.kind ?? oneOf(str(sp.kind), REPORT_KIND)) as ReportKindKey | undefined;
  const custom = str(sp.period) === "custom";
  const period = requirement
    ? { ...phDayRange(requirement.periodStart, requirement.periodEnd), label: `${formatDate(requirement.periodStart.toISOString())} to ${formatDate(requirement.periodEnd.toISOString())}` }
    : resolvePeriod(str(sp.period), custom ? str(sp.from) : undefined, custom ? str(sp.to) : undefined);
  const preview = kind ? await buildReport(kind, session.barangay.code, period) : null;
  const officeId = requirement?.officeId ?? str(sp.office);
  const status = requirement ? reqs.find((r) => r.id === requirement.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipal Submissions" icon="send" title="Submit Reports" description="The figures are generated from your records at the moment you submit, and saved with the submission so the municipality sees exactly what you sent." />

      {!kind ? (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <Card title="Required by the municipality" icon="clipboard" description="Pick one to prepare it.">
            {open.length === 0 ? (
              <p className="text-[14px] text-ink-secondary">No open requirements. You are up to date.</p>
            ) : (
              <ul className="space-y-2">
                {open.map((r) => (
                  <li key={r.id}>
                    <Link href={`${routes.submitReport}?requirement=${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-rule/80 p-4 hover:border-dash-primary/40 hover:bg-dash-primary-soft/30">
                      <span className="min-w-0">
                        <span className="block font-semibold">{r.title}</span>
                        <span className="block text-[12.5px] text-ink-secondary">
                          {r.office.name} · {label(FREQUENCY, r.frequency)} · Due {formatDate(r.dueAt.toISOString())}
                        </span>
                      </span>
                      <StatusBadge status={r.state} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Other report" icon="fileChart" description="Send a report the municipality asked for outside the list.">
            <form method="get" className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Report</span>
                <select name="kind" required defaultValue="" className="field">
                  <option value="" disabled>
                    Choose
                  </option>
                  {options(REPORT_KIND).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Reviewing office</span>
                <select name="office" required defaultValue="" className="field">
                  <option value="" disabled>
                    Choose
                  </option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">Period</span>
                <select name="period" defaultValue="last-month" className="field">
                  {Object.entries(PERIODS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-primary w-full">
                Prepare report
              </button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-3">
            <p className="flex items-center gap-2 text-[13px] text-ink-secondary">
              <Icon name="eye" className="h-4 w-4" /> Preview of what will be sent
            </p>
            {preview && <ReportView report={preview} printable />}
          </div>
          <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card title={requirement?.title ?? label(REPORT_KIND, kind)} icon="send">
              <dl className="mb-4 space-y-2 text-[14px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-secondary">Office</dt>
                  <dd className="text-right font-semibold">{offices.find((o) => o.id === officeId)?.name ?? "Choose below"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-secondary">Period</dt>
                  <dd className="text-right font-semibold">{period.label}</dd>
                </div>
                {requirement && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-secondary">Due</dt>
                    <dd className="text-right font-semibold">{formatDate(requirement.dueAt.toISOString())}</dd>
                  </div>
                )}
              </dl>
              {requirement?.description && <p className="mb-4 rounded-xl bg-ground-muted/70 px-3 py-2.5 text-[13px] text-ink-secondary">{requirement.description}</p>}
              {status?.latest?.status === "RETURNED" && (
                <p className="mb-4 rounded-xl bg-dash-gold-soft px-3 py-2.5 text-[13px] text-dash-gold-ink">
                  <strong>Returned:</strong> {status.latest.remarks ?? "See the reviewer's remarks."}
                </p>
              )}
              {status?.done ? (
                <p className="text-[14px] text-ink-secondary">Already submitted. Check its progress under Submission Status.</p>
              ) : (
                <ActionForm
                  action={submitReport}
                  hidden={{
                    ...(requirement ? { requirementId: requirement.id } : { kind, officeId: officeId ?? "", period: str(sp.period) ?? "this-month", from: str(sp.from) ?? "", to: str(sp.to) ?? "" }),
                  }}
                  className="space-y-4"
                >
                  {!requirement && !officeId && (
                    <label className="block">
                      <span className="mb-1.5 block text-[13px] font-semibold">Reviewing office</span>
                      <select name="officeId" required className="field">
                        {offices.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <Textarea name="notes" label="Notes for the reviewer" rows={4} placeholder="Explain anything unusual in the figures." required={kind === "OTHER"} />
                  <SubmitButton pendingText="Submitting…" className="w-full">
                    <Icon name="send" className="h-4 w-4" /> {status?.latest?.status === "RETURNED" ? "Resubmit" : "Submit to the municipality"}
                  </SubmitButton>
                </ActionForm>
              )}
            </Card>
            <Link href={routes.submitReport} className="btn btn-ghost w-full">
              Choose a different report
            </Link>
          </div>
        </div>
      )}
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
