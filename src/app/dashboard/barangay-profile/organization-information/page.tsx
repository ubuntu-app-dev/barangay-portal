import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import OrganizationView from "@/components/dashboard/profile/views/OrganizationView";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Organizational Information | ${brand.name}`,
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile
        render={(profile) => <OrganizationView profile={profile} />}
      />
    </Suspense>
  );
}
