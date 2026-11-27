import type { Metadata } from "next";
import { Suspense } from "react";
import MunicipalFeed from "@/components/announcements/MunicipalFeed";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Municipal Announcements" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return <MunicipalFeed session={session} sp={sp} title="Municipal Announcements" description="News, memos, and reminders from the municipal government and its offices." icon="megaphone" basePath={routes.municipalAnnouncements} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
