import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { UsersList } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";
import type { SearchParams } from "@/server/params";

export const metadata: Metadata = { title: "Administrators" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const u = await requireRole("SUPERADMIN");
  return <UsersList actor={u} sp={await searchParams} base="/superadmin/administrators" title="Administrators" description="Municipal IT administrators and superadmins. Barangay and municipal staff accounts are managed by each municipality's IT admin." roles={["MUNICIPAL_ADMIN", "SUPERADMIN"]} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
