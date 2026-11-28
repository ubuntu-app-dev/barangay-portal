import { ShieldCheck } from "lucide-react";
import { Reveal, StaggerItem, StaggerList, Tilt } from "@/components/motion";
import { security, securityHighlights } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import { Eyebrow, LandingIcon } from "./icons";

/** Animated shield: rings ripple outward from a 3D-tilted badge. */
function ShieldBadge() {
  return (
    <div aria-hidden="true" className="relative mx-auto flex h-64 w-64 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="shield-ripple absolute inset-8 rounded-full border-2 border-brand/30"
          style={{ animationDelay: `${i * 1.1}s` }}
        />
      ))}
      <span className="absolute inset-14 rounded-full bg-brand/10 blur-xl" />
      <Tilt max={14} rest={{ x: 8, y: -12 }} className="rounded-[28px]">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-[28px] bg-[linear-gradient(145deg,var(--color-brand-fill),color-mix(in_srgb,var(--color-brand-fill)_55%,black))] text-white shadow-[0_24px_50px_rgb(0_56_168/0.35)]">
          <span className="absolute inset-0 rounded-[28px] bg-[linear-gradient(160deg,rgb(255_255_255/0.28),transparent_45%)]" />
          <ShieldCheck className="relative h-16 w-16 [transform:translateZ(40px)]" strokeWidth={1.6} />
          <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-4 border-panel bg-flag-gold [transform:translateZ(60px)]" />
        </div>
      </Tilt>
    </div>
  );
}

export default function Security() {
  return (
    <section id="security" className="scroll-mt-20 bg-panel py-20 md:py-24">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
        <Reveal>
          <Eyebrow>{security.eyebrow}</Eyebrow>
          <h2 className={`${heading2} mt-3 max-w-[18ch]`}>{security.title}</h2>
          <p className="mt-4 max-w-[50ch] text-ink-secondary">{security.text}</p>
          <div className="mt-6 hidden lg:block">
            <ShieldBadge />
          </div>
          <p className="mt-6 max-w-[50ch] rounded-lg border-l-4 border-flag-gold bg-ground-muted px-4 py-3 text-[14px] text-ink-secondary">
            {security.note}
          </p>
        </Reveal>

        <StaggerList className="grid gap-4 sm:grid-cols-2">
          {securityHighlights.map((h) => (
            <StaggerItem key={h.title} className="h-full">
              <Tilt max={6} glare className="h-full rounded-panel">
                <article className="h-full rounded-panel border border-rule bg-ground p-6 transition-shadow [transform-style:preserve-3d] hover:shadow-[0_18px_40px_rgb(0_56_168/0.12)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand [transform:translateZ(30px)]">
                    <LandingIcon name={h.icon} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-[-0.02em]">{h.title}</h3>
                  <p className="mt-2 text-[15px] text-ink-secondary">{h.text}</p>
                </article>
              </Tilt>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
