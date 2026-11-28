import { Reveal } from "@/components/motion";
import { gallery, screens } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import ScreenCarousel from "./gallery/ScreenCarousel";
import { Eyebrow } from "./icons";

export default function Gallery() {
  return (
    <section id="explore" className="relative scroll-mt-20 overflow-x-clip py-20 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[60%] bg-[radial-gradient(ellipse_at_center,rgb(0_56_168/0.10),transparent_65%)]"
      />
      <div className={`${container} relative`}>
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <Eyebrow>{gallery.eyebrow}</Eyebrow>
          <h2 className={`${heading2} mt-3`}>{gallery.title}</h2>
          <p className="mt-4 text-ink-secondary">{gallery.text}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <ScreenCarousel screens={screens} />
        </Reveal>
      </div>
    </section>
  );
}
