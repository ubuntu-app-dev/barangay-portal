import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import PrintPageButton from "@/components/dashboard/ui/PrintPageButton";
import { routes } from "@/config/navigation";
import { buildReport, PERIODIC, resolvePeriod } from "@/server/reports";
import { str, type SearchParams } from "@/server/params";
import type { Session } from "@/types/dashboard";
import type { ReportKindKey } from "@/types/reports";
import PeriodPicker from "./PeriodPicker";
import ReportView from "./ReportView";

/** One report page: the figures, a period picker when it applies, and print / CSV / submit actions. */
export default async function ReportPage({ kind, session, sp, icon, description }: { kind: ReportKindKey; session: Session; sp: SearchParams; icon: IconName; description: string }) {
  const period = resolvePeriod(str(sp.period));
  const report = await buildReport(kind, session.barangay.code, period);
  const periodic = PERIODIC.includes(kind);
  const qs = new URLSearchParams({ kind, ...(periodic ? { period: period.key } : {}) });
  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader eyebrow="Reports and Analytics" icon={icon} title={`${report.title} Report`} description={description}>
          {periodic && <PeriodPicker />}
          <a href={`/api/dashboard/export/report?${qs}`} className="btn btn-secondary">
            <Icon name="download" className="h-4 w-4" /> CSV
          </a>
          <PrintPageButton />
          <Link href={`${routes.submitReport}?${qs}`} className="btn btn-primary">
            <Icon name="send" className="h-4 w-4" /> Submit to municipality
          </Link>
        </PageHeader>
      </div>
      {periodic && <p className="no-print text-[13.5px] font-medium text-ink-secondary">{period.label}</p>}
      <ReportView report={report} />
    </div>
  );
}
