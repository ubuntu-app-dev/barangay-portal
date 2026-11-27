import type { Metadata } from "next";
import { Suspense } from "react";
import NotificationsView from "@/components/announcements/NotificationsView";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireRole } from "@/lib/auth/staff";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Notifications" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("SUPERADMIN");
  return <NotificationsView userId={u.id} sp={await searchParams} basePath="/superadmin/notifications" prefsHref="/superadmin/settings/notification-preferences" />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
