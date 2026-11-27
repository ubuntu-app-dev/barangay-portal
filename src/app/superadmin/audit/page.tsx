import type { Metadata } from "next";
import { Suspense } from "react";
import AuditView from "@/components/admin/AuditView";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireRole } from "@/lib/auth/staff";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Audit Log" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("SUPERADMIN");
  return <AuditView u={u} sp={await searchParams} base="/superadmin/audit" />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
