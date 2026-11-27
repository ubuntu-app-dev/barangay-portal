import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import type { BarangayProfile, Official } from "@/types/profile";
import { FeaturedOfficial, OfficialCard } from "../OfficialCard";
import { OfficialDialog, RemoveOfficial } from "../ProfileDialogs";

export default function OfficialsView({ profile, canEdit }: { profile: BarangayProfile; canEdit: boolean }) {
  const active = profile.officials.filter((o) => o.isActive);
  const past = profile.officials.filter((o) => !o.isActive);
  const captain = active.find((o) => o.position === "Punong Barangay");
  const kagawads = active.filter((o) => o.position === "Barangay Kagawad");
  const others = active.filter((o) => o !== captain && o.position !== "Barangay Kagawad");
  const actions = (o: Official) =>
    canEdit ? (
      <>
        <OfficialDialog official={o} />
        <RemoveOfficial official={o} />
      </>
    ) : undefined;

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex justify-end">
          <OfficialDialog />
        </div>
      )}
      {active.length === 0 ? (
        <Card title="Barangay Officials">
          <EmptyState icon="users" title="No officials recorded" text="Add the Punong Barangay, Kagawads, and other officials to show them here and on certificates." />
        </Card>
      ) : (
        <>
          {captain && <FeaturedOfficial official={captain} actions={actions(captain)} />}
          {kagawads.length > 0 && (
            <Card title="Sangguniang Barangay" icon="users">
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {kagawads.map((o) => (
                  <OfficialCard key={o.id} official={o} actions={actions(o)} />
                ))}
              </ul>
            </Card>
          )}
          {others.length > 0 && (
            <Card title="Other Officials" icon="user">
              <ul className="grid gap-4 md:grid-cols-3">
                {others.map((o) => (
                  <OfficialCard key={o.id} official={o} actions={actions(o)} />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
      {past.length > 0 && (
        <Card title="Past Officials" icon="history" description="Kept for the record and for documents they signed.">
          <ul className="grid gap-4 md:grid-cols-3">
            {past.map((o) => (
              <OfficialCard key={o.id} official={o} actions={actions(o)} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
