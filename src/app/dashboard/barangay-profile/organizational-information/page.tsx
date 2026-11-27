import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import OrganizationView from "@/components/dashboard/profile/views/OrganizationView";

export const metadata: Metadata = { title: "Organizational Information" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile render={(profile, canEdit) => <OrganizationView profile={profile} canEdit={canEdit} />} />
    </Suspense>
  );
}
