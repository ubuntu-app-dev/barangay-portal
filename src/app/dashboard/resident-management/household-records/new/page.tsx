import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import HouseholdForm from "@/components/residents/HouseholdForm";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { createHousehold } from "@/server/actions/residents";
import { getPuroks } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Add Household" };

async function Content() {
  const session = await requireSession();
  const puroks = await getPuroks(session);
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: routes.households, label: "Household Records" }} icon="homePlus" title="Add household" description="Create the household first, then add its members from the household page." />
      <HouseholdForm mode="create" action={createHousehold} puroks={puroks} cancelHref={routes.households} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
