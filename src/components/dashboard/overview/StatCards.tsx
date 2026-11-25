import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";
import { formatNumber } from "@/lib/dashboard/format";
import type { DashboardStats } from "@/types/dashboard";

type Tone = "primary" | "secondary" | "gold";
type Card = {
  id: string;
  label: string;
  icon: IconName;
  tone: Tone;
  value: number;
  line: string;
  now: number;
  prev: number;
  good?: "up" | "down";
  href: string;
};

const tiles: Record<Tone, string> = {
  primary: "bg-dash-primary-soft text-dash-primary",
  secondary: "bg-dash-secondary-soft text-dash-secondary",
  gold: "bg-dash-gold-soft text-dash-gold-ink",
};

function compare(now: number, prev: number, good?: "up" | "down") {
  const diff = now - prev;
  const dir = diff === 0 ? "flat" : diff > 0 ? "up" : "down";
  const text =
    diff === 0
      ? "Same as last month"
      : `${formatNumber(Math.abs(diff))} ${diff > 0 ? "more" : "fewer"} than last month`;
  const color =
    dir === "flat" || !good
      ? "text-ink-secondary"
      : dir === good
        ? "text-dash-primary"
        : "text-flag-red";
  return { dir, text, color };
}

export default function StatCards({ stats: s }: { stats: DashboardStats }) {
  const cards: Card[] = [
    {
      id: "residents",
      label: "Total Residents",
      icon: "users",
      tone: "primary",
      value: s.residents.total,
      line: `${formatNumber(s.residents.newThisMonth)} newly registered this month`,
      now: s.residents.newThisMonth,
      prev: s.residents.previousMonthNew,
      good: "up",
      href: routes.residents,
    },
    {
      id: "households",
      label: "Total Households",
      icon: "home",
      tone: "secondary",
      value: s.households.total,
      line: `${formatNumber(s.households.newThisMonth)} newly registered this month`,
      now: s.households.newThisMonth,
      prev: s.households.previousMonthNew,
      good: "up",
      href: routes.households,
    },
    {
      id: "documents",
      label: "Documents Issued",
      icon: "fileCheck",
      tone: "primary",
      value: s.documents.total,
      line: `${formatNumber(s.documents.thisMonth)} issued this month`,
      now: s.documents.thisMonth,
      prev: s.documents.previousMonth,
      href: routes.issuanceHistory,
    },
    {
      id: "requests",
      label: "Pending Document Requests",
      icon: "clock",
      tone: "gold",
      value: s.requests.pending,
      line: `${formatNumber(s.requests.processing)} currently being processed`,
      now: s.requests.pending,
      prev: s.requests.previousPending,
      good: "down",
      href: routes.certificateRequests,
    },
    {
      id: "incidents",
      label: "Recorded Incidents",
      icon: "shield",
      tone: "secondary",
      value: s.incidents.total,
      line: `${formatNumber(s.incidents.thisMonth)} recorded this month`,
      now: s.incidents.thisMonth,
      prev: s.incidents.previousMonth,
      href: routes.blotter,
    },
    {
      id: "submissions",
      label: "Pending Municipal Submissions",
      icon: "send",
      tone: "gold",
      value: s.submissions.awaitingSubmission,
      line: `${formatNumber(s.submissions.awaitingReview)} awaiting municipal review`,
      now: s.submissions.awaitingSubmission,
      prev: s.submissions.previousAwaitingSubmission,
      good: "down",
      href: routes.pendingSubmissions,
    },
  ];

  return (
    <section aria-label="Statistics overview">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const t = compare(c.now, c.prev, c.good);
          return (
            <li key={c.id}>
              <Link
                href={c.href}
                className="block h-full rounded-xl border border-rule bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-dash-primary hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${tiles[c.tone]}`}
                  >
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <p className="text-[14px] font-semibold text-ink-secondary">
                    {c.label}
                  </p>
                </div>
                <p className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] tabular-nums">
                  {formatNumber(c.value)}
                </p>
                <p className="mt-1 text-[14px] text-ink-secondary">{c.line}</p>
                <p
                  className={`mt-3 flex items-center gap-1.5 border-t border-rule pt-3 text-[13px] font-semibold ${t.color}`}
                >
                  <Icon
                    name={
                      t.dir === "up"
                        ? "trendUp"
                        : t.dir === "down"
                          ? "trendDown"
                          : "minus"
                    }
                    className="h-4 w-4"
                  />
                  {t.text}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
