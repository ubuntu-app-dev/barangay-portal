import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import OfficialsView from "@/components/dashboard/profile/views/OfficialsView";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Barangay Officials | ${brand.name}`,
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile render={(profile) => <OfficialsView profile={profile} />} />
    </Suspense>
  );
}
