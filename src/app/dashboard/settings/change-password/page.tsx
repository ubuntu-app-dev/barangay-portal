import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { PasswordSettings } from "@/components/settings/SettingsPages";
import { requireSession } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Change Password" };

async function Content() {
  await requireSession();
  return <PasswordSettings u={await requireUser()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
