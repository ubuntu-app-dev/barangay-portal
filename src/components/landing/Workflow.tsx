import { Reveal } from "@/components/motion";
import { container, heading2 } from "@/lib/styles";
import { workflowHeading } from "@/data/workflow-content";
import BenefitGrid from "./workflow/BenefitGrid";
import WorkflowBackdrop from "./workflow/WorkflowBackdrop";
import WorkflowTimeline from "./workflow/WorkflowTimeline";

export default function Workflow() {
  return (
    <section
      id="how"
      data-surface="dark"
      className="brand-field relative scroll-mt-16 overflow-hidden py-16 text-on-field md:py-20"
    >
      <WorkflowBackdrop />
      <div className={`${container} relative`}>
        <Reveal>
          <h2 className={`${heading2} max-w-[22ch]`}>
            {workflowHeading.title}
          </h2>
          <p className="mt-4 max-w-[62ch] text-on-field-secondary">
            {workflowHeading.text}
          </p>
        </Reveal>
        <WorkflowTimeline />
        <BenefitGrid />
      </div>
    </section>
  );
}
