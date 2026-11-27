import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import AuditView from "@/components/admin/AuditView";
import { requireRole } from "@/lib/auth/staff";
import type { SearchParams } from "@/server/params";
export const metadata: Metadata = { title: "Audit Log" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_ADMIN");
  return <AuditView u={u} sp={await searchParams} base="/admin/audit" />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
