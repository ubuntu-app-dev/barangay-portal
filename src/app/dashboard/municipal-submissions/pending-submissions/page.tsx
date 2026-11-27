import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { daysUntil, formatDate } from "@/lib/dashboard/format";
import { FREQUENCY, REPORT_KIND, label } from "@/lib/labels";
import { requirementsWithStatus } from "@/server/queries/submissions";

export const metadata: Metadata = { title: "Pending Submissions" };

async function Content() {
  const session = await requireSession();
  const all = await requirementsWithStatus(session);
  const pending = all.filter((r) => !r.done);
  const done = all.filter((r) => r.done);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipal Submissions" icon="clock" title="Pending Submissions" description="What the municipality expects from your barangay, soonest deadline first." />
      <Card title={`${pending.length} to submit`} icon="clock" bodyClassName="p-3">
        {pending.length === 0 ? (
          <EmptyState icon="checkCircle" title="Nothing pending" text="Every municipal requirement has been submitted." />
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => {
              const days = daysUntil(r.dueAt);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rule/80 p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center leading-none ${days < 0 ? "bg-dash-danger-soft text-dash-danger" : days <= 7 ? "bg-dash-gold-soft text-dash-gold-ink" : "bg-dash-primary-soft text-dash-primary"}`}>
                      <span className="font-display text-[16px] font-bold">{Math.abs(days)}</span>
                      <span className="text-[9px] font-semibold uppercase">{days < 0 ? "late" : "days"}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-[12.5px] text-ink-secondary">
                        {r.office.name} · {label(REPORT_KIND, r.kind)} · {label(FREQUENCY, r.frequency)} · Due {formatDate(r.dueAt.toISOString())}
                      </p>
                      {r.latest?.status === "RETURNED" && r.latest.remarks && <p className="mt-1 text-[13px] text-dash-gold-ink">Returned: {r.latest.remarks}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.state} />
                    <Link href={`${routes.submitReport}?requirement=${r.id}`} className="btn btn-primary btn-sm">
                      {r.latest?.status === "RETURNED" ? "Revise" : "Prepare"} <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {done.length > 0 && (
        <Card title="Already submitted" icon="checkCircle" actionLabel="Track status" actionHref={routes.submissionStatus}>
          <ul className="divide-y divide-rule/70">
            {done.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-[14px]">
                <span>
                  <span className="font-semibold">{r.title}</span>
                  <span className="text-ink-secondary"> · {r.office.name}</span>
                </span>
                <StatusBadge status={r.latest?.status === "APPROVED" ? "Approved" : r.latest?.status === "UNDER_REVIEW" ? "Under Review" : "Submitted"} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
