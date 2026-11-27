import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterForm from "@/components/blotter/BlotterForm";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { createBlotterEntry } from "@/server/actions/blotter";
import { str, type SearchParams } from "@/server/params";
import { getPuroks } from "@/server/queries/residents";

export const metadata: Metadata = { title: "New Incident Report" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const puroks = await getPuroks(session);
  const canVawc = can(session.permissions, "vawc:view");
  const vawc = canVawc && str(sp.vawc) === "1";
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Blotter and Incidents" icon="alert" title={vawc ? "New VAWC entry" : "New Incident Report"} description="A blotter number is assigned when you save. The entry is recorded under your name." />
      <BlotterForm action={createBlotterEntry} puroks={puroks} initialKind={str(sp.kind) === "COMPLAINT" ? "COMPLAINT" : "INCIDENT"} canVawc={canVawc} initialVawc={vawc} cancelHref={vawc ? routes.vawc : routes.blotter} />
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
