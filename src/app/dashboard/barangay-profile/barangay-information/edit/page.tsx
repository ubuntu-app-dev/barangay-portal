import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import { InfoForm } from "@/components/dashboard/profile/ProfileForms";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { updateBarangayInfo } from "@/server/actions/profile";

export const metadata: Metadata = { title: "Edit Barangay Information" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile
        render={(profile, canEdit) =>
          canEdit ? <InfoForm action={updateBarangayInfo} profile={profile} /> : <EmptyState icon="lock" title="Restricted" text="Your account cannot edit the barangay profile." />
        }
      />
    </Suspense>
  );
}
