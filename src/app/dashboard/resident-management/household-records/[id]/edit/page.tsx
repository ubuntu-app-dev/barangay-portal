import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import HouseholdForm from "@/components/residents/HouseholdForm";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { updateHousehold } from "@/server/actions/residents";
import { getHousehold, getPuroks } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Edit Household" };

type Props = { params: Promise<{ id: string }> };

async function Content({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const [h, puroks] = await Promise.all([getHousehold(session, id), getPuroks(session)]);
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: `${routes.households}/${h.id}`, label: h.householdNo }} title="Edit household" />
      <HouseholdForm
        mode="edit"
        action={updateHousehold}
        puroks={puroks}
        cancelHref={`${routes.households}/${h.id}`}
        values={{
          id: h.id,
          purokId: h.purokId ?? undefined,
          address: h.address,
          tenure: h.tenure,
          waterSource: h.waterSource,
          toilet: h.toilet,
          hasElectricity: h.hasElectricity,
          monthlyIncome: h.monthlyIncome ? String(h.monthlyIncome) : undefined,
          remarks: h.remarks ?? undefined,
        }}
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
