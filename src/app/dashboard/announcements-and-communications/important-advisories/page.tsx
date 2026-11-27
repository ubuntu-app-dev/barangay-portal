import type { Metadata } from "next";
import { Suspense } from "react";
import MunicipalFeed from "@/components/announcements/MunicipalFeed";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Important Advisories" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return <MunicipalFeed session={session} sp={sp} advisories title="Important Advisories" description="Health, disaster, and safety advisories that need action from the barangay." icon="alert" basePath={routes.advisories} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
