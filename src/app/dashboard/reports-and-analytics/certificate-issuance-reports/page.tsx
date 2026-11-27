import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ReportPage from "@/components/reports/ReportPage";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Certificate Issuance Reports" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return <ReportPage kind="CERTIFICATES" session={session} sp={sp} icon="fileCheck" description="Documents issued and fees collected in the chosen period." />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
