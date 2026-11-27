import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import BarList from "@/components/dashboard/ui/charts/BarList";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { formatDate, formatMonthDay, formatNumber } from "@/lib/dashboard/format";
import type { BarangayProfile } from "@/types/profile";
import BoundaryCompass from "../BoundaryCompass";
import InfoList from "../InfoList";
import { PurokDialog, RemovePurok } from "../ProfileDialogs";

export const PROFILE_EDIT_HREF = "/dashboard/barangay-profile/barangay-information/edit";

export default function InformationView({ profile, canEdit }: { profile: BarangayProfile; canEdit: boolean }) {
  const { general: g, glance, boundaries: b, puroks, about } = profile;
  const rows: [string, string][] = [
    ["Barangay name", g.name],
    ["PSGC code", g.code],
    ["City or municipality", g.municipality],
    ["Province", g.province],
    ["Region", g.region],
    ["Classification", g.classification],
    ["Land area", g.landAreaHectares ? `${g.landAreaHectares} hectares` : "Not set"],
    ["Date established", g.dateEstablished ? formatDate(g.dateEstablished) : "Not set"],
    ["Founding anniversary", g.dateEstablished ? formatMonthDay(g.dateEstablished) : "Not set"],
    ["Puroks or zones", String(puroks.length)],
    ["ZIP code", g.zipCode || "Not set"],
    ["Legislative district", g.legislativeDistrict || "Not set"],
  ];
  const tiles: { icon: IconName; label: string; value: number }[] = [
    { icon: "users", label: "Residents", value: glance.population },
    { icon: "home", label: "Households", value: glance.households },
    { icon: "fileCheck", label: "Registered voters", value: glance.registeredVoters },
    { icon: "star", label: "Senior citizens", value: glance.seniorCitizens },
  ];
  const edit = canEdit ? (
    <Link href={PROFILE_EDIT_HREF} className="btn btn-soft btn-sm">
      <Icon name="edit" className="h-3.5 w-3.5" /> Edit
    </Link>
  ) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="General Information" icon="info" className="lg:col-span-2" actions={edit}>
        <InfoList rows={rows} />
      </Card>
      <Card title="Boundaries" icon="mapPin" actions={edit}>
        <BoundaryCompass name={g.name} north={b.north} east={b.east} south={b.south} west={b.west} />
      </Card>

      <section aria-label="Population at a glance" className="lg:col-span-3">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.label} className="surface flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary">
                <Icon name={t.icon} className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-3xl font-bold tracking-[-0.03em] tabular-nums">{formatNumber(t.value)}</p>
                <p className="text-[13px] text-ink-secondary">{t.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Card title="Puroks and Zones" icon="mapPin" actions={canEdit ? <PurokDialog /> : undefined}>
        <p className="mb-4 text-[13px] text-ink-secondary">Households in each purok.</p>
        <BarList data={puroks} />
        {canEdit && profile.purokRows.length > 0 && (
          <ul className="mt-5 divide-y divide-rule/70 border-t border-rule pt-2">
            {profile.purokRows.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-1.5 text-[13.5px]">
                <span>
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-ink-secondary"> · {formatNumber(p.residents)} residents</span>
                </span>
                <span className="flex">
                  <PurokDialog purok={p} />
                  {p.residents === 0 && p.households === 0 && <RemovePurok purok={p} />}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid gap-6 lg:col-span-2">
        <Card title="History" icon="history" actions={edit}>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-secondary">{about.history || "No history written yet."}</p>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Vision" icon="eye">
            <p className="text-[15px] leading-relaxed text-ink-secondary">{about.vision || "Not set."}</p>
          </Card>
          <Card title="Mission" icon="star">
            <p className="text-[15px] leading-relaxed text-ink-secondary">{about.mission || "Not set."}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
