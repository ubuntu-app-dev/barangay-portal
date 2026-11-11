import type { ComponentType } from "react";
import {
  BarangayIcon,
  DocumentIcon,
  MunicipalityIcon,
  ReportIcon,
  ResidentsIcon,
  UsersIcon,
} from "@/components/icons/icon";
import { CountUp, Reveal, StaggerItem, StaggerList } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import { stats, statsAreSample } from "@/data/stats";
import type { StatIconName } from "@/types/landing";

const icons: Record<StatIconName, ComponentType> = {
  barangay: BarangayIcon,
  municipality: MunicipalityIcon,
  residents: ResidentsIcon,
  documents: DocumentIcon,
  reports: ReportIcon,
  users: UsersIcon,
};

export default function StatsStrip() {
  return (
    <section
      aria-labelledby="stats-title"
      className="border-y border-rule bg-panel py-14 md:py-16"
    >
      <div className={container}>
        <Reveal>
          <h2 id="stats-title" className={`${heading2} max-w-[24ch]`}>
            The platform in numbers
          </h2>
          {statsAreSample && (
            <p className="mt-3 text-[13px] text-ink-secondary">
              Sample figures for demonstration.
            </p>
          )}
        </Reveal>
        <StaggerList className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {stats.map((s) => {
            const Icon = icons[s.icon];
            return (
              <StaggerItem key={s.id} className="border-t border-rule pt-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <Icon />
                </span>
                <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] md:text-5xl">
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </p>
                <p className="mt-1 text-[14px] text-ink-secondary">{s.label}</p>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </div>
    </section>
  );
}
