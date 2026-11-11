import { StaggerItem, StaggerList } from "@/components/motion";
import { workflowBenefits } from "@/data/workflow-content";

export default function BenefitGrid() {
  return (
    <StaggerList className="mt-16 grid gap-4 border-t border-on-field-secondary/25 pt-10 sm:grid-cols-2 lg:grid-cols-4">
      {workflowBenefits.map((b) => (
        <StaggerItem key={b.title}>
          <div className="h-full rounded-panel border border-on-field-secondary/20 bg-white/[0.07] p-5 transition-colors hover:bg-white/15 motion-reduce:transition-none">
            <span
              aria-hidden="true"
              className="block h-1 w-8 rounded-full bg-flag-gold"
            />
            <h3 className="mt-4 font-display text-lg font-bold tracking-[-0.02em]">
              {b.title}
            </h3>
            <p className="mt-1 text-[15px] text-on-field-secondary">{b.text}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
