import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterList from "@/components/blotter/BlotterList";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Case Monitoring" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return (
    <BlotterList
      session={session}
      sp={sp}
      scope={{ open: true }}
      title="Case Monitoring"
      description="Every open case, with Katarungang Pambarangay deadlines first. Red means the period has lapsed."
      icon="clock"
      basePath={routes.cases}
      showDeadline
    />
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
