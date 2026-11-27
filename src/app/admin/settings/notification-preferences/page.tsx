import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { PreferenceSettings } from "@/components/settings/SettingsPages";
import { requireRole } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Notification Preferences" };

async function Content() {
  return <PreferenceSettings u={await requireRole("MUNICIPAL_ADMIN")} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
