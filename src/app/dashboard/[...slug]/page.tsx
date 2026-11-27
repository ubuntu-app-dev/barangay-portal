import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ModulePlaceholder from "@/components/dashboard/modules/ModulePlaceholder";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import { findNavEntry, hrefOf, navSections } from "@/config/navigation";
import { can } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";

type Props = { params: Promise<{ slug: string[] }> };

async function Module({ params }: Props) {
  const { slug } = await params;
  const href = `/dashboard/${slug.join("/")}`;

  // A section URL (e.g. /dashboard/resident-management) opens its first page.
  const section = navSections.flatMap((s) => s.items).find((i) => i.children?.length && hrefOf(i) === href);
  if (section) redirect(hrefOf(section, section.children![0]));

  const entry = findNavEntry(href);
  if (!entry) notFound();

  // Checked on the server: hiding a menu item is not access control.
  const session = await requireSession();
  if (!can(session.permissions, entry.requires)) {
    return (
      <div className="surface mx-auto max-w-[560px]">
        <EmptyState icon="lock" title="Restricted access" text="Your account does not have permission to open this section." />
      </div>
    );
  }
  return <ModulePlaceholder title={entry.title} parent={entry.parent} />;
}

/** Section URLs redirect; any menu page without its own route lands here. */
export default function ModulePage({ params }: Props) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Module params={params} />
    </Suspense>
  );
}
