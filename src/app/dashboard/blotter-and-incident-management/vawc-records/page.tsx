import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterList from "@/components/blotter/BlotterList";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "VAWC Records" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  // Checked on the server: hiding the menu item is not access control.
  if (!can(session.permissions, "vawc:view"))
    return (
      <div className="surface mx-auto max-w-[560px]">
        <EmptyState icon="lock" title="Restricted access" text="VAWC records are only open to the designated VAW desk officer. Ask your municipal IT administrator if you need access." />
      </div>
    );
  const sp = await searchParams;
  return (
    <BlotterList
      session={session}
      sp={sp}
      scope={{ vawc: true }}
      title="VAWC Records"
      description="Violence against women and children cases (RA 9262). Kept apart from every other list and report."
      icon="lock"
      basePath={routes.vawc}
      newHref={`${routes.newIncident}?vawc=1`}
      newLabel="New VAWC entry"
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
