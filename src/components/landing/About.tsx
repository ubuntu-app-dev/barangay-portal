import { Reveal, StaggerItem, StaggerList, Tilt } from "@/components/motion";
import { about, principles } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import { Eyebrow, LandingIcon } from "./icons";

/** One flag color per principle: blue, red, gold. */
const accents = [
  { bar: "bg-brand", tile: "bg-brand/10 text-brand" },
  { bar: "bg-flag-red", tile: "bg-flag-red/10 text-flag-red" },
  { bar: "bg-flag-gold", tile: "bg-flag-gold/25 text-dash-gold-ink" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-rule bg-panel py-20 md:py-24">
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <Eyebrow>{about.eyebrow}</Eyebrow>
            <h2 className={`${heading2} mt-3 max-w-[20ch]`}>{about.title}</h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-4 text-[17px] text-ink-secondary lg:pt-9">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </Reveal>
        </div>

        <StaggerList className="mt-14 grid gap-5 md:grid-cols-3">
          {principles.map((p, i) => (
            <StaggerItem key={p.title} className="h-full">
              <Tilt max={8} glare className="h-full rounded-panel">
              <article className="relative h-full overflow-hidden rounded-panel border border-rule bg-ground p-6 transition-shadow hover:shadow-[0_20px_44px_rgb(22_25_31/0.12)]">
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accents[i].bar}`} />
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[i].tile}`}>
                    <LandingIcon name={p.icon} />
                  </span>
                  <span aria-hidden="true" className="font-display text-3xl font-bold text-rule">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 text-[15px] text-ink-secondary">{p.text}</p>
              </article>
              </Tilt>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
