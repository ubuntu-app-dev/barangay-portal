import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { UsersList } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";
import type { SearchParams } from "@/server/params";
export const metadata: Metadata = { title: "User Accounts" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("MUNICIPAL_ADMIN");
  return <UsersList actor={u} sp={await searchParams} base="/admin/users" title="User Accounts" description="Barangay secretaries and municipal personnel of the municipality. Accounts are personal; never share one." />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
