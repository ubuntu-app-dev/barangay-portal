import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ReportView from "@/components/reports/ReportView";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/dashboard/format";
import { REPORT_KIND, SUBMISSION_STATUS, label } from "@/lib/labels";
import { str, type SearchParams } from "@/server/params";
import { getSubmission } from "@/server/queries/submissions";
import type { ReportData } from "@/types/reports";

export const metadata: Metadata = { title: "Submission" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

const STEPS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] as const;

async function Content({ params, searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const s = await getSubmission(session, id);
  const report = s.data as unknown as ReportData;
  const hasReport = report && Array.isArray(report.sections);
  const stepIndex = s.status === "RETURNED" ? 1 : STEPS.indexOf(s.status as (typeof STEPS)[number]);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader back={{ href: routes.submissionHistory, label: "Submission History" }} eyebrow={`${label(REPORT_KIND, s.kind)}${s.version > 1 ? ` · version ${s.version}` : ""}`} title={s.title} description={`Sent to ${s.office.name}`}>
          <PrintPageButton />
          {s.status === "RETURNED" && s.requirementId && (
            <Link href={`${routes.submitReport}?requirement=${s.requirementId}`} className="btn btn-primary">
              <Icon name="refresh" className="h-4 w-4" /> Revise and resubmit
            </Link>
          )}
        </PageHeader>
      </div>
      <SavedNotice value={str(sp.saved)} />

      <ol aria-label="Progress" className="no-print surface grid grid-cols-3 gap-2 p-4">
        {STEPS.map((step, i) => {
          const reached = i <= stepIndex;
          const returned = s.status === "RETURNED" && i === 1;
          return (
            <li key={step} className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${returned ? "bg-dash-gold text-[#16191f]" : reached ? "bg-brand-fill text-white" : "bg-ground-muted text-ink-secondary"}`}>
                {returned ? "!" : reached ? <Icon name="check" className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`text-[13.5px] font-semibold ${reached ? "" : "text-ink-secondary"}`}>{returned ? "Returned for revision" : label(SUBMISSION_STATUS, step)}</span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0">{hasReport ? <ReportView report={report} printable /> : <Card title="Submitted figures">No generated figures were saved with this submission.</Card>}</div>
        <div className="no-print space-y-6">
          <Card title="Status" icon="info" actions={<StatusBadge status={label(SUBMISSION_STATUS, s.status)} />}>
            <DetailList
              columns={1}
              rows={[
                ["Period", `${formatDate(s.periodStart.toISOString())} to ${formatDate(s.periodEnd.toISOString())}`],
                ["Submitted", s.submittedAt ? `${formatDateTime(s.submittedAt.toISOString())}${s.submitter ? ` by ${s.submitter.firstName} ${s.submitter.lastName}` : ""}` : null],
                ["Reviewed", s.reviewedAt ? `${formatDateTime(s.reviewedAt.toISOString())}${s.reviewer ? ` by ${s.reviewer.firstName} ${s.reviewer.lastName}` : ""}` : null],
                ["Due", s.requirement ? formatDate(s.requirement.dueAt.toISOString()) : null],
              ]}
            />
          </Card>
          {s.remarks && (
            <Card title="Reviewer's remarks" icon="megaphone">
              <p className={`rounded-xl px-4 py-3 text-[14px] ${s.status === "RETURNED" ? "bg-dash-gold-soft text-dash-gold-ink" : "bg-ground-muted"}`}>{s.remarks}</p>
            </Card>
          )}
          {s.notes && (
            <Card title="Your notes" icon="clipboard">
              <p className="whitespace-pre-line text-[14px] text-ink-secondary">{s.notes}</p>
            </Card>
          )}
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
