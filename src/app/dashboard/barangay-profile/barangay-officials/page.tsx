import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import OfficialsView from "@/components/dashboard/profile/views/OfficialsView";

export const metadata: Metadata = { title: "Barangay Officials" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile render={(profile, canEdit) => <OfficialsView profile={profile} canEdit={canEdit} />} />
    </Suspense>
  );
}
