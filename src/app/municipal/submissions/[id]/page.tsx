import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import ReportView from "@/components/reports/ReportView";
import { requireRole } from "@/lib/auth/staff";
import { formatDate, formatDateTime } from "@/lib/dashboard/format";
import { REPORT_KIND, SUBMISSION_STATUS, label } from "@/lib/labels";
import { reviewSubmission } from "@/server/actions/municipal";
import { getSubmissionForReview } from "@/server/queries/municipal";
import type { ReportData } from "@/types/reports";

export const metadata: Metadata = { title: "Review Submission" };

type Props = { params: Promise<{ id: string }> };

async function Content({ params }: Props) {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const { id } = await params;
  const s = await getSubmissionForReview(u, id);
  const report = s.data as unknown as ReportData;
  const open = s.status === "SUBMITTED" || s.status === "UNDER_REVIEW";
  const late = s.submittedAt && s.requirement && s.submittedAt > s.requirement.dueAt;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader back={{ href: "/municipal/submissions", label: "Submissions" }} eyebrow={`Barangay ${s.barangay.name} · ${label(REPORT_KIND, s.kind)}${s.version > 1 ? ` · version ${s.version}` : ""}`} title={s.title} description={`For the ${s.office.name}`}>
          <PrintPageButton />
          {open && s.canReview && (
            <>
              {s.status === "SUBMITTED" && (
                <ActionDialog trigger="Start review" triggerClassName="btn btn-secondary" title="Start reviewing?" description="The barangay sees that their report is under review." action={reviewSubmission} hidden={{ id: s.id, decision: "start" }} confirmLabel="Start review" icon="eye" />
              )}
              <ActionDialog
                trigger={<><Icon name="refresh" className="h-4 w-4" /> Return</>}
                triggerClassName="btn btn-secondary text-dash-gold-ink"
                title="Return for revision"
                description="The barangay secretary is notified and can resubmit a corrected version."
                action={reviewSubmission}
                hidden={{ id: s.id, decision: "return" }}
                confirmLabel="Return to barangay"
                icon="refresh"
              >
                <Textarea name="remarks" label="What should they correct?" rows={4} required />
              </ActionDialog>
              <ActionDialog trigger={<><Icon name="checkCircle" className="h-4 w-4" /> Approve</>} triggerClassName="btn btn-primary" title="Approve this report?" description="The barangay secretary is notified." action={reviewSubmission} hidden={{ id: s.id, decision: "approve" }} confirmLabel="Approve" icon="checkCircle">
                <Textarea name="remarks" label="Remarks (optional)" rows={3} />
              </ActionDialog>
            </>
          )}
        </PageHeader>
      </div>
      {open && !s.canReview && <p className="no-print rounded-xl bg-dash-secondary-soft px-4 py-3 text-[14px] text-dash-secondary">This report is for the {s.office.name}. You can read it, but only that office can decide on it.</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0">{report && Array.isArray(report.sections) ? <ReportView report={report} printable /> : <Card title="Submitted figures">No generated figures were saved.</Card>}</div>
        <div className="no-print space-y-6">
          <Card title="Status" icon="info" actions={<StatusBadge status={label(SUBMISSION_STATUS, s.status)} />}>
            <DetailList
              columns={1}
              rows={[
                ["Period", `${formatDate(s.periodStart.toISOString())} to ${formatDate(s.periodEnd.toISOString())}`],
                ["Submitted", s.submittedAt ? `${formatDateTime(s.submittedAt.toISOString())}${s.submitter ? ` by ${s.submitter.firstName} ${s.submitter.lastName}` : ""}` : null],
                ["Due", s.requirement ? <span className={late ? "text-dash-danger" : ""}>{formatDateTime(s.requirement.dueAt.toISOString())}{late ? " (submitted late)" : ""}</span> : null],
                ["Reviewed", s.reviewedAt ? `${formatDateTime(s.reviewedAt.toISOString())}${s.reviewer ? ` by ${s.reviewer.firstName} ${s.reviewer.lastName}` : ""}` : null],
                ["Remarks", s.remarks],
              ]}
            />
          </Card>
          {s.notes && (
            <Card title="Notes from the barangay" icon="clipboard">
              <p className="whitespace-pre-line text-[14px] text-ink-secondary">{s.notes}</p>
            </Card>
          )}
          {s.versions.length > 1 && (
            <Card title="Versions" icon="history">
              <ul className="space-y-2 text-[13.5px]">
                {s.versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-2">
                    <Link href={`/municipal/submissions/${v.id}`} className={`font-semibold hover:text-dash-primary hover:underline ${v.id === s.id ? "text-dash-primary" : ""}`}>
                      Version {v.version}
                    </Link>
                    <StatusBadge status={label(SUBMISSION_STATUS, v.status)} />
                  </li>
                ))}
              </ul>
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
