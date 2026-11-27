import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { PreferenceSettings } from "@/components/settings/SettingsPages";
import { requireSession } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Notification Preferences" };

async function Content() {
  await requireSession();
  return <PreferenceSettings u={await requireUser()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
