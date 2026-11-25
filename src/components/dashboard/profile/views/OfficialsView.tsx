import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import type { BarangayProfile } from "@/types/profile";
import { FeaturedOfficial, OfficialCard } from "../OfficialCard";

export default function OfficialsView({ profile }: { profile: BarangayProfile }) {
  const { officials } = profile;
  const captain = officials.find((o) => o.position === "Punong Barangay");
  const kagawads = officials.filter((o) => o.position === "Barangay Kagawad");
  const others = officials.filter((o) => ["SK Chairperson", "Barangay Secretary", "Barangay Treasurer"].includes(o.position));

  if (officials.length === 0) {
    return <Card title="Barangay Officials"><EmptyState icon="users" title="No officials recorded" text="Barangay officials will appear here once they are added to the profile." /></Card>;
  }
  return (
    <div className="space-y-6">
      {captain && <FeaturedOfficial official={captain} />}
      <Card title="Sangguniang Barangay">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{kagawads.map((o) => <OfficialCard key={o.id} official={o} />)}</ul>
      </Card>
      <Card title="Other Officials">
        <ul className="grid gap-4 md:grid-cols-3">{others.map((o) => <OfficialCard key={o.id} official={o} />)}</ul>
      </Card>
    </div>
  );
}
