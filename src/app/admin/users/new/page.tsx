import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { NewUser } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";
export const metadata: Metadata = { title: "New Account" };

async function Content() {
  const u = await requireRole("MUNICIPAL_ADMIN");
  return <NewUser actor={u} base="/admin/users" />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
