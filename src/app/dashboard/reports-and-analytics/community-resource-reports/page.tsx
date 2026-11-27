import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ReportPage from "@/components/reports/ReportPage";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Community Resource Reports" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return <ReportPage kind="COMMUNITY_RESOURCES" session={session} sp={sp} icon="box" description="Barangay resources by category and condition, and registered animals." />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
