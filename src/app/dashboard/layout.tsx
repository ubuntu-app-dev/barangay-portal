import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import DashboardShell from "@/components/dashboard/shell/DashboardShell";
import { ShellSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireSession } from "@/lib/auth/session";
import { brand } from "@/lib/brand";
import { getNavBadges, getNotifications } from "@/lib/dashboard/data";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: { default: `Dashboard | ${brand.name}`, template: `%s | ${brand.name}` },
  robots: { index: false },
};

/** Signed-in only. The barangay and permissions come from the session, never from the URL. */
async function Gate({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const [notifications, badges] = await Promise.all([
    getNotifications(session),
    getNavBadges(session),
  ]);
  return (
    <DashboardShell
      ws="secretary"
      user={session.user}
      scopeLabel={session.barangay.name}
      banner={(await getSettings()).maintenanceBanner}
      permissions={session.permissions}
      notifications={notifications}
      badges={badges}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
