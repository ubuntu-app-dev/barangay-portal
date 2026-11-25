import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import InformationView from "@/components/dashboard/profile/views/InformationView";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Barangay Information | ${brand.name}`,
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile
        render={(profile) => <InformationView profile={profile} />}
      />
    </Suspense>
  );
}
