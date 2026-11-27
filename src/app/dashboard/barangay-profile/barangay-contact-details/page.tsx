import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import ContactView from "@/components/dashboard/profile/views/ContactView";

export const metadata: Metadata = { title: "Barangay Contact Details" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile render={(profile, canEdit) => <ContactView profile={profile} canEdit={canEdit} />} />
    </Suspense>
  );
}
