import type { Metadata } from "next";
import { Suspense } from "react";
import SettingsForm from "@/components/admin/SettingsForm";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireRole } from "@/lib/auth/staff";
import { saveSystemSettings } from "@/server/actions/superadmin";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = { title: "System Settings" };

async function Content() {
  await requireRole("SUPERADMIN");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="System" icon="settings" title="System Settings" description="Security and notices for every user of LGU Connect. Every change is logged." />
      <SettingsForm action={saveSystemSettings} v={await getSettings()} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
