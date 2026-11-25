import { notFound } from "next/navigation";
import { Suspense } from "react";
import ModulePlaceholder from "@/components/dashboard/modules/ModulePlaceholder";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import { findNavEntry } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";

type Props = { params: Promise<{ slug: string[] }> };

async function Module({ params }: Props) {
  const { slug } = await params;
  const entry = findNavEntry(`/dashboard/${slug.join("/")}`);
  if (!entry) notFound();

  // Checked on the server: hiding a menu item is not access control.
  const session = await requireSession();
  if (!can(session.permissions, entry.requires)) {
    return (
      <div className="mx-auto max-w-[560px] rounded-xl border border-rule bg-panel shadow-sm">
        <EmptyState
          icon="lock"
          title="Restricted access"
          text="Your account does not have permission to open this section."
        />
      </div>
    );
  }
  return <ModulePlaceholder title={entry.title} parent={entry.parent} />;
}

/** Every menu page that is not built yet lands here. */
export default function ModulePage({ params }: Props) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Module params={params} />
    </Suspense>
  );
}
