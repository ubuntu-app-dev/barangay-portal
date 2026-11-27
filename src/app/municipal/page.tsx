import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { requireRole } from "@/lib/auth/staff";
import { formatDate, formatNumber, formatPercent } from "@/lib/dashboard/format";
import { SUBMISSION_STATUS, label } from "@/lib/labels";
import { municipalOverview } from "@/server/queries/municipal";

async function Content() {
  const u = await requireRole("MUNICIPAL_PERSONNEL");
  const d = await municipalOverview(u);
  const open = d.requirements.filter((r) => r.done < r.expected);
  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#0038a8_0%,#0b46c2_55%,#2a62d9_100%)] p-6 text-white shadow-[0_18px_40px_rgb(0_56_168/0.25)] sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
          <Icon name="mapPin" className="h-3.5 w-3.5" /> {u.municipality!.name}, {u.municipality!.province}
          {u.office && ` · ${u.office.acronym ?? u.office.name}`}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold">Magandang araw, {u.firstName}!</h1>
        <p className="mt-1 max-w-[62ch] text-white/80">
          {d.inbox ? `${d.inbox} new submission${d.inbox === 1 ? "" : "s"} waiting for ${u.office ? "your office" : "review"}.` : "No new submissions waiting."} {d.active} of {d.total} barangays are on LGU Connect.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/municipal/submissions" className="btn btn-gold">
            <Icon name="inbox" className="h-4 w-4" /> Review submissions
          </Link>
          <Link href="/municipal/requirements" className="btn border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Icon name="clipboard" className="h-4 w-4" /> Require a report
          </Link>
          <Link href="/municipal/announcements" className="btn border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Icon name="megaphone" className="h-4 w-4" /> Post an announcement
          </Link>
        </div>
      </header>
      <StatTiles
        columns={5}
        tiles={[
          { icon: "users", label: "Residents on record", value: formatNumber(d.population), hint: "Active barangays", tone: "primary", href: "/municipal/barangays" },
          { icon: "home", label: "Households", value: formatNumber(d.households), tone: "secondary" },
          { icon: "fileCheck", label: "Documents this month", value: formatNumber(d.docsMonth), tone: "success" },
          { icon: "shield", label: "Open blotter cases", value: formatNumber(d.openCases), hint: "VAWC excluded", tone: d.openCases ? "gold" : "success" },
          { icon: "inbox", label: "Awaiting review", value: formatNumber(d.inbox), tone: d.inbox ? "danger" : "success", href: "/municipal/submissions" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Requirements in progress" icon="clipboard" actionLabel="Compliance" actionHref="/municipal/compliance">
          {open.length === 0 ? (
            <EmptyState icon="checkCircle" title="Every barangay is up to date" text="Open requirements will show their progress here." />
          ) : (
            <ul className="space-y-4">
              {open.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link href={`/municipal/compliance?requirement=${r.id}`} className="group block">
                    <div className="flex items-baseline justify-between gap-3 text-[14px]">
                      <span className="font-semibold group-hover:text-dash-primary">{r.title}</span>
                      <span className="whitespace-nowrap tabular-nums text-ink-secondary">
                        {r.done}/{r.expected}
                      </span>
                    </div>
                    <div aria-hidden="true" className="mt-1.5 h-2 overflow-hidden rounded-full bg-ground-muted">
                      <div className={`h-full rounded-full ${r.dueAt < new Date() ? "bg-dash-danger" : "bg-dash-primary"}`} style={{ width: formatPercent(r.done, r.expected) }} />
                    </div>
                    <p className="mt-1 text-[12px] text-ink-secondary">
                      {r.office.name} · due {formatDate(r.dueAt.toISOString())}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Latest submissions" icon="inbox" actionLabel="Inbox" actionHref="/municipal/submissions">
          {d.recent.length === 0 ? (
            <EmptyState icon="inbox" title="No submissions yet" text="Reports from barangays will appear here." />
          ) : (
            <ul className="divide-y divide-rule/70">
              {d.recent.map((s) => (
                <li key={s.id}>
                  <Link href={`/municipal/submissions/${s.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-dash-primary">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold">{s.title}</span>
                      <span className="block text-[12.5px] text-ink-secondary">
                        Barangay {s.barangay.name} · {s.submittedAt ? formatDate(s.submittedAt.toISOString()) : "Draft"}
                      </span>
                    </span>
                    <StatusBadge status={label(SUBMISSION_STATUS, s.status)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Content />
    </Suspense>
  );
}
