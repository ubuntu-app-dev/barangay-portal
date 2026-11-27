import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import DocumentTypeView from "@/components/documents/DocumentTypeView";
import { requireSession } from "@/lib/auth/session";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Certificate of Good Moral Character" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  return <DocumentTypeView typeKey="good-moral" session={session} sp={sp} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
