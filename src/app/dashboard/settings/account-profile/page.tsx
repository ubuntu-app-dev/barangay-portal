import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { AccountSettings } from "@/components/settings/SettingsPages";
import { requireSession } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Account Profile" };

async function Content() {
  await requireSession();
  return <AccountSettings u={await requireUser()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
