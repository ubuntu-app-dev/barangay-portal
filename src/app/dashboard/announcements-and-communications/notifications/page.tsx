import type { Metadata } from "next";
import { Suspense } from "react";
import NotificationsView from "@/components/announcements/NotificationsView";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Notifications" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  return <NotificationsView userId={session.user.id} sp={await searchParams} basePath={routes.notifications} prefsHref={routes.accountSettings} eyebrow="Announcements and Communications" />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
