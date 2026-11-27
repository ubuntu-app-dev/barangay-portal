import type { Metadata } from "next";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import SubmissionTable from "@/components/submissions/SubmissionTable";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatNumber } from "@/lib/dashboard/format";
import { db } from "@/server/db";
import { flat, type SearchParams } from "@/server/params";
import { listSubmissions } from "@/server/queries/submissions";

export const metadata: Metadata = { title: "Submission Status" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const [list, groups] = await Promise.all([
    listSubmissions(session, sp, ["SUBMITTED", "UNDER_REVIEW", "RETURNED"]),
    db.submission.groupBy({ by: ["status"], where: { barangayCode: session.barangay.code }, _count: true }),
  ]);
  const c = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipal Submissions" icon="refresh" title="Submission Status" description="Reports waiting for the municipality, and reports returned to you for revision." />
      <StatTiles
        tiles={[
          { icon: "send", label: "Submitted, not yet opened", value: formatNumber(c("SUBMITTED")), tone: "secondary" },
          { icon: "eye", label: "Under review", value: formatNumber(c("UNDER_REVIEW")), tone: "primary" },
          { icon: "alert", label: "Returned for revision", value: formatNumber(c("RETURNED")), tone: c("RETURNED") ? "gold" : "success", href: `${routes.submissionStatus}?status=RETURNED` },
          { icon: "checkCircle", label: "Approved", value: formatNumber(c("APPROVED")), tone: "success", href: `${routes.submissionHistory}?status=APPROVED` },
        ]}
      />
      <Card title="In progress" icon="refresh" description="Open a returned report to read the remarks and resubmit.">
        <SubmissionTable rows={list.rows} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={routes.submissionStatus} />
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
