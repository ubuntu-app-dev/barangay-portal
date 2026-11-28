import { Building2, Clock, KeyRound, Mail, Phone } from "lucide-react";
import { ButtonLink } from "@/components/shared";
import { Reveal } from "@/components/motion";
import { contact } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import { ROUTES } from "@/lib/routes";
import { Eyebrow } from "./icons";
import { WavingFlag } from "./PhilippineFlag";

const cardIcons = [KeyRound, Building2];

export default function Contact() {
  const d = contact.details;
  const details = [
    d.office && { icon: Building2, label: "Office", value: d.office },
    d.email && { icon: Mail, label: "Email", value: d.email, href: `mailto:${d.email}` },
    d.phone && { icon: Phone, label: "Phone", value: d.phone, href: `tel:${d.phone.replace(/[^\d+]/g, "")}` },
    d.hours && { icon: Clock, label: "Office hours", value: d.hours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="scroll-mt-20 border-t border-rule py-20 md:py-24">
      <div className={container}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <Eyebrow>{contact.eyebrow}</Eyebrow>
            <h2 className={`${heading2} mt-3 max-w-[18ch]`}>{contact.title}</h2>
            <p className="mt-4 max-w-[44ch] text-ink-secondary">{contact.text}</p>
            {details.length > 0 && (
              <dl className="mt-8 space-y-4">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <dt className="text-[13px] text-ink-secondary">{label}</dt>
                      <dd className="font-medium">
                        {href ? <a href={href} className="hover:text-brand hover:underline">{value}</a> : value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>

          <div className="grid gap-4">
            {contact.cards.map((c, i) => {
              const Icon = cardIcons[i % cardIcons.length];
              return (
                <Reveal key={c.title} delay={0.08 * i}>
                  <article className="flex gap-4 rounded-panel border border-rule bg-panel p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold tracking-[-0.02em]">{c.title}</h3>
                      <p className="mt-1.5 text-[15px] text-ink-secondary">{c.text}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Closing call to action */}
        <Reveal className="mt-14">
          <div
            data-surface="dark"
            className="brand-field relative overflow-hidden rounded-2xl px-6 py-10 text-on-field md:px-12 md:py-12"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle,rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:20px_20px]" />
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-flag-gold/20 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-6">
                <div className="hidden shrink-0 [perspective:700px] sm:block">
                  <div className="rounded-md shadow-[0_18px_40px_rgb(0_0_0/0.35)] [transform:rotateY(-18deg)_rotateX(6deg)]">
                    <WavingFlag width={150} strips={24} />
                  </div>
                </div>
                <div>
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.025em]">
                  {contact.cta.title}
                </h2>
                <p className="mt-2 max-w-[52ch] text-on-field-secondary">{contact.cta.text}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <ButtonLink href={ROUTES.login} variant="gold">
                  {contact.cta.button}
                  <span aria-hidden="true" className="ml-2">&rarr;</span>
                </ButtonLink>
                <p className="text-[13px] text-on-field-secondary">{contact.cta.note}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
