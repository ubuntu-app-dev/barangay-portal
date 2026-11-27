import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import SubmissionTable from "@/components/submissions/SubmissionTable";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatNumber } from "@/lib/dashboard/format";
import { REPORT_KIND, SUBMISSION_STATUS, options } from "@/lib/labels";
import { flat, type SearchParams } from "@/server/params";
import { listSubmissions } from "@/server/queries/submissions";

export const metadata: Metadata = { title: "Submission History" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const list = await listSubmissions(session, sp);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Municipal Submissions" icon="history" title="Submission History" description="Every report sent to the municipality, including earlier versions of resubmitted reports.">
        <Link href={routes.submitReport} className="btn btn-primary">
          <Icon name="send" className="h-4 w-4" /> Submit a report
        </Link>
      </PageHeader>
      <Card title={`${formatNumber(list.total)} submission${list.total === 1 ? "" : "s"}`} icon="send">
        <ListToolbar
          placeholder="Search report or office"
          filters={[
            { name: "status", label: "Status", options: options(SUBMISSION_STATUS) },
            { name: "kind", label: "Report", options: options(REPORT_KIND) },
          ]}
        />
        <SubmissionTable rows={list.rows} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={routes.submissionHistory} />
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
