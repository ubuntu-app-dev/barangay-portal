import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { UserDetail } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";
export const metadata: Metadata = { title: "Manage Account" };

type Props = { params: Promise<{ id: string }> };

async function Content({ params }: Props) {
  const u = await requireRole("MUNICIPAL_ADMIN");
  return <UserDetail actor={u} id={(await params).id} base="/admin/users" />;
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
