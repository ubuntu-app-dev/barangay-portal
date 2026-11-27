import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import type { BarangayProfile } from "@/types/profile";
import BodiesGrid from "../BodiesGrid";
import OrgChart from "../OrgChart";
import { BodyDialog, RemoveBody } from "../ProfileDialogs";

export default function OrganizationView({ profile, canEdit }: { profile: BarangayProfile; canEdit: boolean }) {
  const kagawads = profile.officials.filter((o) => o.isActive && o.position === "Barangay Kagawad");
  return (
    <div className="space-y-6">
      <Card title="Organizational Structure" icon="sitemap">
        <OrgChart officials={profile.officials} />
      </Card>
      <Card title="Committees of the Sangguniang Barangay" icon="users" description="Edit committees on the Officials tab.">
        {kagawads.length === 0 ? (
          <EmptyState icon="users" title="No Kagawads recorded" text="Add them on the Officials tab." />
        ) : (
          <ul className="grid gap-x-8 md:grid-cols-2">
            {kagawads.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-4 border-b border-rule/80 py-3 text-[14px]">
                <span className="font-semibold">{o.committee || "No committee"}</span>
                <span className="text-right text-ink-secondary">{o.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Barangay Councils and Bodies" icon="layers" actions={canEdit ? <BodyDialog /> : undefined}>
        <BodiesGrid
          bodies={profile.bodies}
          actions={
            canEdit
              ? (b) => (
                  <>
                    <BodyDialog body={b} />
                    <RemoveBody body={b} />
                  </>
                )
              : undefined
          }
        />
      </Card>
    </div>
  );
}
