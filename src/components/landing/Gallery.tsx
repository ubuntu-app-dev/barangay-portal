import { FanGallery } from "@/components/fan-gallery"; // installed by: npx shadcn@latest add https://reactdrops.dev/r/fan-gallery.json
import { Reveal } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import {
  galleryHeading,
  galleryIsIllustrative,
  galleryItems,
} from "@/data/gallery-content";

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="scroll-mt-16 overflow-x-clip py-16 md:py-20"
    >
      <div className={container}>
        <Reveal>
          <h2 className={`${heading2} max-w-[22ch]`}>{galleryHeading.title}</h2>
          <p className="mt-4 max-w-[62ch] text-ink-secondary">
            {galleryHeading.text}
          </p>
        </Reveal>
      </div>
      <div className="mt-6">
        <FanGallery
          items={galleryItems}
          entrance="stack"
          cardWidth={230}
          radius={14}
          ariaLabel="Gallery of platform screens"
        />
      </div>
      {galleryIsIllustrative && (
        <p
          className={`${container} mt-2 text-center text-[13px] text-ink-secondary`}
        >
          {galleryHeading.note}
        </p>
      )}
    </section>
  );
}
