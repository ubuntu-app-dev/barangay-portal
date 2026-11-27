import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ResidentForm from "@/components/residents/ResidentForm";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { createResident } from "@/server/actions/residents";
import { db } from "@/server/db";
import { str, type SearchParams } from "@/server/params";
import { getPuroks } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Add New Resident" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const puroks = await getPuroks(session);
  // Coming from a household page: start with that household chosen.
  const hhId = str(sp.household);
  const hh = hhId ? await db.household.findFirst({ where: { id: hhId, barangayCode: session.barangay.code, deletedAt: null } }) : null;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Resident Management" icon="userPlus" title="Add New Resident" description="Fields marked * are required. The resident number is assigned when you save." />
      <ResidentForm
        mode="create"
        action={createResident}
        puroks={puroks}
        cancelHref={hh ? `${routes.households}/${hh.id}` : routes.residents}
        household={hh ? { value: hh.id, label: hh.householdNo, sub: hh.address } : null}
        values={hh ? { purokId: hh.purokId ?? undefined, address: hh.address } : undefined}
      />
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
