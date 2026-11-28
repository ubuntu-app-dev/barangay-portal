import { Check } from "lucide-react";
import { ButtonLink } from "@/components/shared";
import { AnimatedHeadline, Reveal } from "@/components/motion";
import { hero } from "@/data/landing-content";
import { container } from "@/lib/styles";
import { ROUTES, SECTIONS } from "@/lib/routes";
import DashboardMockup from "./DashboardMockup";
import { WavingFlag } from "./PhilippineFlag";

export default function Hero() {
  return (
    <section id="home" className="relative scroll-mt-20 overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgb(0_56_168/0.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]"
      />
      <div
        className={`${container} relative grid items-center gap-14 pb-20 pt-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-24`}
      >
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-rule bg-panel px-3 py-1.5 text-[13px] font-medium text-ink-secondary shadow-sm">
            <span className="overflow-hidden rounded-[3px] shadow-sm">
              <WavingFlag width={30} strips={10} amplitude={1.5} />
            </span>
            {hero.eyebrow}
          </div>
          <AnimatedHeadline
            text={hero.title}
            highlight={hero.highlight}
            className="mt-5 font-display text-[clamp(2.3rem,5vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.03em]"
          />
          <p className="mt-6 max-w-[54ch] text-lg text-ink-secondary">
            {hero.text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={ROUTES.login}>
              {hero.primary}
              <span aria-hidden="true" className="ml-2">&rarr;</span>
            </ButtonLink>
            <ButtonLink href={SECTIONS.explore} variant="secondary">
              {hero.secondary}
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-secondary">
            {hero.facts.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="h-4 w-4 text-brand" strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15} className="px-4 sm:px-8 lg:px-0">
          <DashboardMockup />
        </Reveal>
      </div>
    </section>
  );
}
