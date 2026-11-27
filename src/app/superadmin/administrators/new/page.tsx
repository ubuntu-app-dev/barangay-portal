import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { NewUser } from "@/components/users/UsersViews";
import { requireRole } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "New Administrator" };

async function Content() {
  const u = await requireRole("SUPERADMIN");
  return <NewUser actor={u} base="/superadmin/administrators" roles={["MUNICIPAL_ADMIN", "SUPERADMIN"]} />;
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
