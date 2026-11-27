import type { Metadata } from "next";
import { Suspense } from "react";
import BlotterList from "@/components/blotter/BlotterList";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { formatNumber } from "@/lib/dashboard/format";
import type { SearchParams } from "@/server/params";
import { kpStageCounts, OPEN_STATUSES } from "@/server/queries/blotter";

export const metadata: Metadata = { title: "Katarungang Pambarangay" };

type Props = { searchParams: Promise<SearchParams> };

const STEPS: { stage: "MEDIATION" | "CONCILIATION" | "ARBITRATION"; title: string; text: string; icon: IconName }[] = [
  { stage: "MEDIATION", title: "Mediation", text: "Before the Punong Barangay. 15 days.", icon: "users" },
  { stage: "CONCILIATION", title: "Conciliation", text: "Before the Pangkat ng Tagapagkasundo. 15 days, extendable by 15.", icon: "scale" },
  { stage: "ARBITRATION", title: "Arbitration", text: "When both parties agree to an award. Award within 10 days.", icon: "fileCheck" },
];

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const counts = await kpStageCounts(session);
  const open = (stage: string) => counts.filter((c) => c.kpStage === stage && (OPEN_STATUSES as readonly string[]).includes(c.status)).reduce((s, c) => s + c._count, 0);
  const total = counts.reduce((s, c) => s + c._count, 0);
  const settled = counts.filter((c) => c.status === "SETTLED" || c.status === "CLOSED").reduce((s, c) => s + c._count, 0);
  const cfa = counts.filter((c) => c.status === "CERTIFIED_TO_FILE_ACTION").reduce((s, c) => s + c._count, 0);

  const intro = (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.stage} className="surface relative p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-secondary">Step {i + 1}</p>
                <p className="font-display text-[16px] font-bold">{s.title}</p>
              </div>
              <span className="ml-auto font-display text-[28px] font-bold tabular-nums">{formatNumber(open(s.stage))}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-ink-secondary">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="surface grid grid-cols-2 gap-3 p-4 lg:grid-cols-1">
        <div>
          <p className="text-[12.5px] text-ink-secondary">Settled amicably</p>
          <p className="font-display text-[22px] font-bold tabular-nums text-dash-success">
            {formatNumber(settled)} <span className="text-[13px] font-medium text-ink-secondary">of {formatNumber(total)}</span>
          </p>
        </div>
        <div>
          <p className="text-[12.5px] text-ink-secondary">Certified to file action</p>
          <p className="font-display text-[22px] font-bold tabular-nums">{formatNumber(cfa)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <BlotterList
      session={session}
      sp={sp}
      scope={{ kp: true }}
      title="Katarungang Pambarangay"
      description="Barangay justice cases (RA 7160, Sec. 399 to 422). File a complaint as a KP case from its page, then track hearings and deadlines here."
      icon="scale"
      basePath={routes.kp}
      showDeadline
      intro={intro}
    />
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
