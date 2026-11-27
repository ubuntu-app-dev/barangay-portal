import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ShellSkeleton } from "@/components/dashboard/ui/Skeleton";
import StaffLayout from "@/components/workspace/StaffLayout";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `Municipal System | ${brand.name}`, template: `%s | ${brand.name}` },
  robots: { index: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <StaffLayout ws="municipal">{children}</StaffLayout>
    </Suspense>
  );
}
