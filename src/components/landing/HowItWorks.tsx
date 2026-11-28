import { Reveal } from "@/components/motion";
import { how } from "@/data/landing-content";
import { container, heading2 } from "@/lib/styles";
import { Eyebrow } from "./icons";
import WorkflowBackdrop from "./workflow/WorkflowBackdrop";
import WorkflowTimeline from "./workflow/WorkflowTimeline";

export default function HowItWorks() {
  return (
    <section
      id="how"
      data-surface="dark"
      className="brand-field relative scroll-mt-20 overflow-hidden py-20 text-on-field md:py-24"
    >
      <WorkflowBackdrop />
      <div className={`${container} relative`}>
        <Reveal className="max-w-[44rem]">
          <Eyebrow onDark>{how.eyebrow}</Eyebrow>
          <h2 className={`${heading2} mt-3`}>{how.title}</h2>
          <p className="mt-4 text-on-field-secondary">{how.text}</p>
        </Reveal>

        <WorkflowTimeline />

      </div>
    </section>
  );
}
