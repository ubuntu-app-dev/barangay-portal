import { Reveal } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import { levelsHeading } from "@/data/levels-content";
import ExpandableLevels from "./levels/ExpandableLevels";

export default function UserLevels() {
  return (
    <section
      id="levels"
      className="scroll-mt-16 bg-ground-muted py-16 md:py-20"
    >
      <div className={container}>
        <Reveal>
          <h2 className={`${heading2} max-w-[22ch]`}>{levelsHeading.title}</h2>
          <p className="mt-4 max-w-[62ch] text-ink-secondary">
            {levelsHeading.text}
          </p>
        </Reveal>
        <ExpandableLevels />
      </div>
    </section>
  );
}
