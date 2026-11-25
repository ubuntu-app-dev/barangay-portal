import Card from "@/components/dashboard/ui/Card";
import BarList from "@/components/dashboard/ui/charts/BarList";
import DonutChart from "@/components/dashboard/ui/charts/DonutChart";
import { routes } from "@/config/navigation";
import type { Demographics } from "@/types/dashboard";

const heading = "mb-3 text-[14px] font-bold";

export default function DemographicsSection({
  data,
  className = "",
}: {
  data: Demographics;
  className?: string;
}) {
  return (
    <Card
      title="Resident Demographics"
      actionLabel="View full report"
      actionHref={routes.demographics}
      className={className}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className={heading}>Male and Female Population</h3>
          <DonutChart data={data.sex} label="Male and female population" />
        </div>
        <div>
          <h3 className={heading}>Population by Age Group</h3>
          <BarList data={data.ageGroups} />
        </div>
        <div>
          <h3 className={heading}>Household Distribution</h3>
          <DonutChart
            data={data.households}
            label="Household distribution by size"
          />
        </div>
        <div>
          <h3 className={heading}>Resident Classification</h3>
          <BarList data={data.classification} tone="secondary" />
          <p className="mt-3 text-[12px] text-ink-secondary">
            A resident can belong to more than one classification.
          </p>
        </div>
      </div>
    </Card>
  );
}
