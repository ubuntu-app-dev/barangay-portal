import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterList from "@/components/blotter/BlotterList";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Blotter Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return (
    <BlotterList
      session={session}
      sp={sp}
      scope={{}}
      title="Blotter Records"
      description="Every incident and complaint recorded in the barangay blotter, newest first."
      icon="shield"
      basePath={routes.blotter}
      newHref={routes.newIncident}
      newLabel="New entry"
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
