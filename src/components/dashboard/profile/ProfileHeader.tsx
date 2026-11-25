import SampleDataBanner from "@/components/dashboard/overview/SampleDataBanner";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { formatNumber } from "@/lib/dashboard/format";
import type { BarangayProfile } from "@/types/profile";

export default function ProfileHeader({ profile }: { profile: BarangayProfile }) {
  const { general: g, glance } = profile;
  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: "users", label: "Population", value: formatNumber(glance.population) },
    { icon: "home", label: "Households", value: formatNumber(glance.households) },
    { icon: "expand", label: "Land area", value: `${g.landAreaHectares} ha` },
  ];
  return (
    <div className="space-y-4">
      {profile.source === "sample" && <SampleDataBanner />}
      <section aria-label="Barangay summary" className="overflow-hidden rounded-3xl border border-rule bg-panel shadow-sm">
        <div aria-hidden="true" className="h-24 bg-[linear-gradient(120deg,#dfe8fb_0%,#eef3fe_55%,#fff6cc_100%)]" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end gap-x-6 gap-y-4">
            <span aria-hidden="true" className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-brand text-white shadow-md"><Icon name="building" className="h-10 w-10" /></span>
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-0.02em]">{g.name}</h1>
              <p className="text-ink-secondary">{g.municipality}, {g.province}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold">
                <li className="rounded-full bg-brand/10 px-3 py-1 text-brand">PSGC {g.code}</li>
                <li className="rounded-full bg-ground-muted px-3 py-1 text-ink-secondary">{g.classification} barangay</li>
                <li className="rounded-full bg-dash-gold-soft px-3 py-1 text-dash-gold-ink">Established {g.dateEstablished.slice(0, 4)}</li>
              </ul>
            </div>
            <dl className="grid w-full grid-cols-3 gap-3 sm:w-auto">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl bg-ground-muted px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-[12px] text-ink-secondary"><Icon name={f.icon} className="h-3.5 w-3.5" />{f.label}</dt>
                  <dd className="font-display text-xl font-bold tabular-nums">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
