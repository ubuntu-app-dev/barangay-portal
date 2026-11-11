import { Reveal } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import { bento, systemsHeading } from "@/data/systems-content";
import AccessScene from "./systems/AccessScene";
import BentoCard from "./systems/BentoCard";
import ClearanceScene from "./systems/ClearanceScene";
import FlowScene from "./systems/FlowScene";
import ReportingScene from "./systems/ReportingScene";

export default function SystemsOverview() {
  return (
    <section id="systems" className="scroll-mt-16 py-16 md:py-20">
      <div className={container}>
        <Reveal>
          <h2 className={`${heading2} max-w-[24ch]`}>{systemsHeading.title}</h2>
          <p className="mt-4 max-w-[62ch] text-ink-secondary">
            {systemsHeading.text}
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-12 md:gap-5">
          <Reveal className="h-full md:col-span-7">
            <BentoCard {...bento.barangay}>
              <ClearanceScene />
            </BentoCard>
          </Reveal>
          <Reveal delay={0.1} className="h-full md:col-span-5">
            <BentoCard {...bento.municipal}>
              <ReportingScene />
            </BentoCard>
          </Reveal>
          <Reveal className="h-full md:col-span-5">
            <BentoCard {...bento.flow}>
              <FlowScene />
            </BentoCard>
          </Reveal>
          <Reveal delay={0.1} className="h-full md:col-span-7">
            <BentoCard {...bento.access} decorative={false}>
              <AccessScene />
            </BentoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
