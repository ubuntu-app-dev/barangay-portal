import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import { ContactForm } from "@/components/dashboard/profile/ProfileForms";
import WithProfile from "@/components/dashboard/profile/WithProfile";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { updateBarangayContacts } from "@/server/actions/profile";

export const metadata: Metadata = { title: "Edit Contact Details" };

export default function Page() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <WithProfile
        render={(profile, canEdit) =>
          canEdit ? <ContactForm action={updateBarangayContacts} profile={profile} /> : <EmptyState icon="lock" title="Restricted" text="Your account cannot edit the barangay profile." />
        }
      />
    </Suspense>
  );
}
