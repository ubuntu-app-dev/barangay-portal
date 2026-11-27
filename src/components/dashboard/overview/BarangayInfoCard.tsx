import Card from "@/components/dashboard/ui/Card";
import { routes } from "@/config/navigation";
import { formatNumber } from "@/lib/dashboard/format";
import type { DashboardData, Session } from "@/types/dashboard";

export default function BarangayInfoCard({ session, info, className = "" }: { session: Session; info: DashboardData["barangayInfo"]; className?: string }) {
  const { barangay } = session;
  const rows: [string, string][] = [
    ["PSGC code", barangay.code],
    ["City or municipality", barangay.municipality],
    ["Province", barangay.province],
    ["Puroks", formatNumber(info.puroks)],
    ["Punong Barangay", info.captain],
    ["Barangay Secretary", info.secretary],
  ];
  return (
    <Card title="Barangay Information" icon="building" actionLabel="Profile" actionHref={routes.profile} className={className}>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-dash-primary-soft px-4 py-3">
          <p className="text-[12px] font-semibold text-dash-primary">Residents</p>
          <p className="font-display text-2xl font-bold tabular-nums text-dash-primary">{formatNumber(info.totalResidents)}</p>
        </div>
        <div className="rounded-2xl bg-dash-gold-soft px-4 py-3">
          <p className="text-[12px] font-semibold text-dash-gold-ink">Households</p>
          <p className="font-display text-2xl font-bold tabular-nums text-dash-gold-ink">{formatNumber(info.totalHouseholds)}</p>
        </div>
      </div>
      <dl className="divide-y divide-rule/80">
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
