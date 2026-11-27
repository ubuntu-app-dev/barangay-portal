import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { AccountSettings } from "@/components/settings/SettingsPages";
import { requireRole } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Account Profile" };

async function Content() {
  return <AccountSettings u={await requireRole("SUPERADMIN")} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
