import Card from "@/components/dashboard/ui/Card";
import type { BarangayProfile } from "@/types/profile";
import BodiesGrid from "../BodiesGrid";
import OrgChart from "../OrgChart";

export default function OrganizationView({ profile }: { profile: BarangayProfile }) {
  const kagawads = profile.officials.filter((o) => o.position === "Barangay Kagawad");
  return (
    <div className="space-y-6">
      <Card title="Organizational Structure"><OrgChart officials={profile.officials} /></Card>
      <Card title="Committees of the Sangguniang Barangay">
        <ul className="grid gap-x-8 md:grid-cols-2">
          {kagawads.map((o) => (
            <li key={o.id} className="flex items-baseline justify-between gap-4 border-b border-rule py-3 text-[14px]">
              <span className="font-semibold">{o.committee}</span>
              <span className="text-right text-ink-secondary">{o.name}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Barangay Councils and Bodies"><BodiesGrid bodies={profile.bodies} /></Card>
    </div>
  );
}
