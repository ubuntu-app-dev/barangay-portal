import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";
import { formatNumber } from "@/lib/dashboard/format";
import type { DashboardStats } from "@/types/dashboard";

type Tone = "primary" | "secondary" | "gold" | "danger";
type CardDef = {
  id: string;
  label: string;
  icon: IconName;
  tone: Tone;
  value: number;
  line: string;
  trend?: { now: number; prev: number; good?: "up" | "down"; noun: string };
  href: string;
};

const tiles: Record<Tone, string> = {
  primary: "bg-dash-primary-soft text-dash-primary",
  secondary: "bg-dash-secondary-soft text-dash-secondary",
  gold: "bg-dash-gold-soft text-dash-gold-ink",
  danger: "bg-dash-danger-soft text-dash-danger",
};

function compare(now: number, prev: number, noun: string, good?: "up" | "down") {
  const diff = now - prev;
  const dir = diff === 0 ? "flat" : diff > 0 ? "up" : "down";
  const text = diff === 0 ? `Same ${noun} as last month` : `${formatNumber(Math.abs(diff))} ${diff > 0 ? "more" : "fewer"} ${noun} than last month`;
  const color = dir === "flat" || !good ? "text-ink-secondary" : dir === good ? "text-dash-success" : "text-dash-danger";
  return { dir, text, color };
}

export default function StatCards({ stats: s }: { stats: DashboardStats }) {
  const cards: CardDef[] = [
    {
      id: "residents",
      label: "Residents",
      icon: "users",
      tone: "primary",
      value: s.residents.total,
      line: `${formatNumber(s.residents.newThisMonth)} registered this month`,
      trend: { now: s.residents.newThisMonth, prev: s.residents.previousMonthNew, good: "up", noun: "new" },
      href: routes.residents,
    },
    {
      id: "households",
      label: "Households",
      icon: "home",
      tone: "secondary",
      value: s.households.total,
      line: `${formatNumber(s.households.newThisMonth)} added this month`,
      trend: { now: s.households.newThisMonth, prev: s.households.previousMonthNew, good: "up", noun: "new" },
      href: routes.households,
    },
    {
      id: "documents",
      label: "Documents issued",
      icon: "fileCheck",
      tone: "primary",
      value: s.documents.total,
      line: `${formatNumber(s.documents.thisMonth)} issued this month`,
      trend: { now: s.documents.thisMonth, prev: s.documents.previousMonth, noun: "issued" },
      href: routes.issuanceHistory,
    },
    {
      id: "requests",
      label: "Pending requests",
      icon: "clock",
      tone: "gold",
      value: s.requests.pending,
      line: `${formatNumber(s.requests.processing)} processing · ${formatNumber(s.requests.ready)} ready for release`,
      trend: { now: s.requests.receivedThisMonth, prev: s.requests.receivedLastMonth, noun: "received" },
      href: routes.certificateRequests,
    },
    {
      id: "incidents",
      label: "Open blotter cases",
      icon: "shield",
      tone: s.incidents.open > 0 ? "danger" : "secondary",
      value: s.incidents.open,
      line: `${formatNumber(s.incidents.thisMonth)} recorded this month`,
      trend: { now: s.incidents.thisMonth, prev: s.incidents.previousMonth, good: "down", noun: "recorded" },
      href: routes.blotter,
    },
    {
      id: "submissions",
      label: "Reports to submit",
      icon: "send",
      tone: "gold",
      value: s.submissions.awaitingSubmission,
      line: `${formatNumber(s.submissions.awaitingReview)} under municipal review${s.submissions.returned ? ` · ${s.submissions.returned} returned` : ""}`,
      href: routes.pendingSubmissions,
    },
  ];

  return (
    <section aria-label="Statistics overview">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const t = c.trend ? compare(c.trend.now, c.trend.prev, c.trend.noun, c.trend.good) : null;
          return (
            <li key={c.id}>
              <Link
                href={c.href}
                className="surface group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-dash-primary/40 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink-secondary">{c.label}</p>
                    <p className="mt-2 font-display text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums">{formatNumber(c.value)}</p>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tiles[c.tone]}`}>
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] text-ink-secondary">{c.line}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule/80 pt-3 text-[12.5px] font-semibold">
                  {t ? (
                    <span className={`flex items-center gap-1.5 ${t.color}`}>
                      <Icon name={t.dir === "up" ? "trendUp" : t.dir === "down" ? "trendDown" : "minus"} className="h-4 w-4" />
                      {t.text}
                    </span>
                  ) : (
                    <span className="text-ink-secondary">From municipal requirements</span>
                  )}
                  <Icon name="arrowRight" className="h-4 w-4 text-ink-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-dash-primary" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
