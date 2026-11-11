import ButtonLink from "@/components/shared/ButtonLink";
import { Reveal } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import { ROUTES } from "@/lib/routes";
import { ctaContent } from "@/data/cta-content";
import WorkspaceList from "./cta/WorkspaceList";

export default function CallToAction() {
  return (
    <section
      data-surface="dark"
      className="brand-field relative overflow-hidden py-16 text-on-field md:py-24"
    >
      {/* Tone-on-tone Philippines map, cut out of the field with a CSS mask. Decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-[135%] w-[55%] -translate-y-1/2 bg-on-field/10 [-webkit-mask-image:url(/philippines.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-image:url(/philippines.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      />
      <div
        className={`${container} relative grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14`}
      >
        <Reveal>
          <h2 className={`${heading2} max-w-[18ch]`}>{ctaContent.title}</h2>
          <p className="mt-4 max-w-[48ch] text-on-field-secondary">
            {ctaContent.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href={ROUTES.login} variant="gold">
              Sign in
            </ButtonLink>
            <p className="text-[14px] text-on-field-secondary">
              {ctaContent.note}
            </p>
          </div>
        </Reveal>
        <WorkspaceList />
      </div>
    </section>
  );
}
