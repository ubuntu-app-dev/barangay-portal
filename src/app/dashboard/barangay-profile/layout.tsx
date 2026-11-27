import { Suspense, type ReactNode } from "react";
import ProfileHeader from "@/components/dashboard/profile/ProfileHeader";
import { HeaderSkeleton } from "@/components/dashboard/profile/ProfileSkeleton";
import ProfileTabs from "@/components/dashboard/profile/ProfileTabs";
import WithProfile from "@/components/dashboard/profile/WithProfile";

/** Shared by the four profile pages: the barangay summary on top, then the section tabs. */
export default function BarangayProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <WithProfile render={(profile) => <ProfileHeader profile={profile} />} />
      </Suspense>
      <ProfileTabs />
      {children}
    </div>
  );
}
