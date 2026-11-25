import Card from "@/components/dashboard/ui/Card";
import { routes } from "@/config/navigation";
import { formatNumber } from "@/lib/dashboard/format";
import type { DashboardData, Session } from "@/types/dashboard";

export default function BarangayInfoCard({ session, info, className = "" }: { session: Session; info: DashboardData["barangayInfo"]; className?: string }) {
  const { barangay } = session;
  const rows: [string, string][] = [
    ["Barangay Name", barangay.name],
    ["Barangay Code", barangay.code],
    ["Municipality", barangay.municipality],
    ["Province", barangay.province],
    ["Total Registered Residents", formatNumber(info.totalResidents)],
    ["Total Households", formatNumber(info.totalHouseholds)],
    ["Barangay Captain", info.captain],
    ["Barangay Secretary", info.secretary],
  ];
  return (
    <Card title="Barangay Information" actionLabel="View Barangay Profile" actionHref={routes.profile} className={className}>
      <dl className="divide-y divide-rule">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px]">
            <dt className="text-ink-secondary">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
