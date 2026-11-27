import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import InformationView from "@/components/dashboard/profile/views/InformationView";

export const metadata: Metadata = { title: "Barangay Information" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile render={(profile, canEdit) => <InformationView profile={profile} canEdit={canEdit} />} />
    </Suspense>
  );
}
