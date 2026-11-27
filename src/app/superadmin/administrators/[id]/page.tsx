import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { UserDetail } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Manage Administrator" };

type Props = { params: Promise<{ id: string }> };

async function Content({ params }: Props) {
  const u = await requireRole("SUPERADMIN");
  return <UserDetail actor={u} id={(await params).id} base="/superadmin/administrators" roles={["MUNICIPAL_ADMIN", "SUPERADMIN"]} />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
