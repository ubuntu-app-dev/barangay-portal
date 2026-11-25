import Link from "next/link";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { routes } from "@/config/navigation";

/** Stands in for menu pages that are not built yet, so no menu link ends in a 404. */
export default function ModulePlaceholder({ title, parent }: { title: string; parent?: string }) {
  return (
    <div className="mx-auto max-w-[560px] rounded-xl border border-rule bg-panel p-6 text-center shadow-sm">
      <h1 className="visually-hidden">{title}</h1>
      <EmptyState icon="clipboard" title={`${title} is not built yet`} text={`${parent ? `${parent}: ` : ""}This page is in the menu but has not been built yet.`} />
      <Link href={routes.home} className="btn btn-primary">Back to the dashboard</Link>
    </div>
  );
}
