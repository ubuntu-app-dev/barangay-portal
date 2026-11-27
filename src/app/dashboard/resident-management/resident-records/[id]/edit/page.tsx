import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import ResidentForm from "@/components/residents/ResidentForm";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { isoDay, nameFull } from "@/lib/dashboard/format";
import { updateResident } from "@/server/actions/residents";
import { getPuroks, getResident } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Edit Resident" };

type Props = { params: Promise<{ id: string }> };

async function Content({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const [r, puroks] = await Promise.all([getResident(session, id), getPuroks(session)]);
  const s = (v: string | null | undefined) => v ?? undefined;
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: `${routes.residents}/${r.id}`, label: nameFull(r) }} eyebrow={r.residentNo} title="Edit resident" description="Every change is recorded in the change history with your name." />
      <ResidentForm
        mode="edit"
        action={updateResident}
        puroks={puroks}
        cancelHref={`${routes.residents}/${r.id}`}
        household={r.household ? { value: r.household.id, label: r.household.householdNo, sub: r.household.address } : null}
        values={{
          id: r.id,
          firstName: r.firstName,
          middleName: s(r.middleName),
          lastName: r.lastName,
          suffix: s(r.suffix),
          sex: r.sex,
          birthDate: isoDay(r.birthDate),
          birthPlace: s(r.birthPlace),
          civilStatus: r.civilStatus,
          citizenship: r.citizenship,
          religion: s(r.religion),
          occupation: s(r.occupation),
          education: s(r.education),
          contactNumber: s(r.contactNumber),
          email: s(r.email),
          philsysNo: s(r.philsysNo),
          purokId: s(r.purokId),
          address: r.address,
          residentSince: r.residentSince ? String(r.residentSince) : undefined,
          relationship: s(r.relationship),
          isRegisteredVoter: r.isRegisteredVoter,
          voterPrecinct: s(r.voterPrecinct),
          isPwd: r.isPwd,
          disability: s(r.disability),
          isSoloParent: r.isSoloParent,
          is4Ps: r.is4Ps,
          isIndigenous: r.isIndigenous,
          isOfw: r.isOfw,
          isOutOfSchoolYouth: r.isOutOfSchoolYouth,
          seniorIdNo: s(r.seniorIdNo),
          status: r.status,
          remarks: s(r.remarks),
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
