import HeroMap from "./HeroMap";
import { ButtonLink } from "@/components/shared";
import { Reveal, RotatingWord } from "@/components/motion";
import { heroHeadline } from "@/data/landing-content";
import { container } from "@/lib/styles";
import { ROUTES, SECTIONS } from "@/lib/routes";

export default function Hero() {
  return (
    <section className={`${container} pb-14 pt-12 md:pt-16`}>
      <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr] min-[1050px]:gap-16">
        <Reveal>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.03em]">
            <span className="visually-hidden">
              {heroHeadline.lead} {heroHeadline.words[0]}
            </span>
            <span aria-hidden="true">
              {heroHeadline.lead} <RotatingWord words={heroHeadline.words} />
            </span>
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg text-ink-secondary">
            A centralized LGU platform that joins the Barangay Information
            System and the Municipal System, so the barangay secretary,
            municipal personnel, and Superadmin work from one source of records.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={ROUTES.login}>Sign in</ButtonLink>
            <ButtonLink href={SECTIONS.systems} variant="secondary">
              Explore the two systems
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <HeroMap />
        </Reveal>
      </div>
    </section>
  );
}
