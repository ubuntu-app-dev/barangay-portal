import { Check } from "lucide-react";
import { Reveal, StaggerItem, StaggerList, Tilt } from "@/components/motion";
import { featureCategories, features } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import { Eyebrow, LandingIcon } from "./icons";

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-ground-muted py-20 md:py-24">
      <div className={container}>
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className={`${heading2} mt-3`}>{features.title}</h2>
          <p className="mt-4 text-ink-secondary">{features.text}</p>
        </Reveal>

        <StaggerList className="mt-12 grid gap-5 md:grid-cols-2">
          {featureCategories.map((c) => (
            <StaggerItem key={c.title} className="h-full">
              <Tilt max={5} glare className="h-full rounded-panel">
              <article className="group flex h-full flex-col rounded-panel border border-rule bg-panel p-6 shadow-[0_1px_2px_rgb(22_25_31/0.04),0_10px_24px_rgb(22_25_31/0.05)] transition-shadow hover:shadow-[0_24px_50px_rgb(0_56_168/0.12)] md:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-fill text-white shadow-[0_6px_14px_rgb(0_56_168/0.25)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <LandingIcon name={c.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.02em]">{c.title}</h3>
                    <p className="mt-1 inline-flex rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
                      {c.audience}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] text-ink-secondary">{c.text}</p>
                <ul className="mt-5 space-y-2.5 border-t border-rule pt-5">
                  {c.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px]">
                      <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              </Tilt>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
