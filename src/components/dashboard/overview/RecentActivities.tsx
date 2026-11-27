import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";
import { formatDateTime } from "@/lib/dashboard/format";
import type { Activity } from "@/types/dashboard";

const ICONS: Record<string, IconName> = {
  Resident: "user",
  Household: "home",
  Family: "users",
  IssuedDocument: "fileCheck",
  DocumentRequest: "inbox",
  BlotterEntry: "shield",
  Submission: "send",
  Announcement: "megaphone",
  Animal: "paw",
  CommunityResource: "box",
  Barangay: "building",
  BarangayOfficial: "user",
  User: "key",
};

/** A timeline of the latest changes in the barangay, from the audit log. */
export default function RecentActivities({ rows, className = "" }: { rows: Activity[]; className?: string }) {
  return (
    <Card title="Recent Activities" icon="history" actionLabel="View all" actionHref={routes.activities} className={className}>
      {rows.length === 0 ? (
        <EmptyState icon="history" title="No activity yet" text="Changes to records will appear here as they happen." />
      ) : (
        <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-rule">
          {rows.map((a) => (
            <li key={a.id} className="relative flex gap-3">
              <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule bg-panel text-dash-primary">
                <Icon name={ICONS[a.entity] ?? "check"} className="h-4 w-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[14px] font-semibold leading-snug">{a.description}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-secondary">
                  {a.performedBy} · {formatDateTime(a.at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
