import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { PasswordSettings } from "@/components/settings/SettingsPages";
import { requireRole } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Change Password" };

async function Content() {
  return <PasswordSettings u={await requireRole("SUPERADMIN")} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
