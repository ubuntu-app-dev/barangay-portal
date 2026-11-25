import Card from "@/components/dashboard/ui/Card";
import BarList from "@/components/dashboard/ui/charts/BarList";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { formatDate, formatMonthDay, formatNumber } from "@/lib/dashboard/format";
import type { BarangayProfile } from "@/types/profile";
import BoundaryCompass from "../BoundaryCompass";
import InfoList from "../InfoList";

export default function InformationView({ profile }: { profile: BarangayProfile }) {
  const { general: g, glance, boundaries: b, puroks, about } = profile;
  const rows: [string, string][] = [
    ["Barangay name", g.name],
    ["PSGC code", g.code],
    ["City or municipality", g.municipality],
    ["Province", g.province],
    ["Region", g.region],
    ["Classification", g.classification],
    ["Land area", `${g.landAreaHectares} hectares`],
    ["Date established", formatDate(g.dateEstablished)],
    ["Founding anniversary", formatMonthDay(g.dateEstablished)],
    ["Puroks or zones", String(puroks.length)],
    ["ZIP code", g.zipCode],
    ["Legislative district", g.legislativeDistrict],
  ];
  const tiles: { icon: IconName; label: string; value: number }[] = [
    { icon: "users", label: "Residents", value: glance.population },
    { icon: "home", label: "Households", value: glance.households },
    { icon: "fileCheck", label: "Registered voters", value: glance.registeredVoters },
    { icon: "user", label: "Senior citizens", value: glance.seniorCitizens },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="General Information" className="lg:col-span-2"><InfoList rows={rows} /></Card>
      <Card title="Boundaries"><BoundaryCompass name={g.name} north={b.north} east={b.east} south={b.south} west={b.west} /></Card>

      <section aria-label="Population at a glance" className="lg:col-span-3">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.label} className="flex items-center gap-4 rounded-2xl border border-rule bg-panel p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={t.icon} className="h-6 w-6" /></span>
              <div>
                <p className="font-display text-3xl font-bold tracking-[-0.03em] tabular-nums">{formatNumber(t.value)}</p>
                <p className="text-[13px] text-ink-secondary">{t.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Card title="Puroks and Zones">
        <p className="mb-4 text-[13px] text-ink-secondary">Households in each purok.</p>
        <BarList data={puroks} />
      </Card>
      <div className="grid gap-6 lg:col-span-2">
        <Card title="History"><p className="text-[15px] leading-relaxed text-ink-secondary">{about.history}</p></Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Vision"><p className="text-[15px] leading-relaxed text-ink-secondary">{about.vision}</p></Card>
          <Card title="Mission"><p className="text-[15px] leading-relaxed text-ink-secondary">{about.mission}</p></Card>
        </div>
      </div>
    </div>
  );
}
