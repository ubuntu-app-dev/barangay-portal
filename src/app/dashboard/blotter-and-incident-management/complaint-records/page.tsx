import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterList from "@/components/blotter/BlotterList";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Complaint Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return (
    <BlotterList
      session={session}
      sp={sp}
      scope={{ kind: "COMPLAINT" }}
      title="Complaint Records"
      description="Complaints between parties. Open one to start mediation under the Katarungang Pambarangay."
      icon="clipboard"
      basePath={routes.complaints}
      newHref={`${routes.newIncident}?kind=COMPLAINT`}
      newLabel="New complaint"
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
