import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import LiveClock from "@/components/dashboard/shell/LiveClock";
import { routes } from "@/config/navigation";
import type { Session } from "@/types/dashboard";

export default function WelcomeHeader({
  session,
  unread,
}: {
  session: Session;
  unread: number;
}) {
  const { user, barangay } = session;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <header className="overflow-hidden rounded-xl border border-rule bg-panel shadow-sm">
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-[2] bg-dash-primary" />
        <span className="flex-1 bg-flag-red" />
        <span className="flex-1 bg-dash-gold" />
      </div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-0.02em]">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-1 text-ink-secondary">
            Here&rsquo;s an overview of your barangay&rsquo;s administrative
            activities and records.
          </p>
          <div className="mt-4">
            <LiveClock />
          </div>
        </div>
        <div className="rounded-xl bg-dash-primary-soft p-4">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-dash-primary">
            <Icon name="building" className="h-4 w-4" />
            Active barangay account
          </p>
          <p className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-dash-primary">
            {barangay.name}
          </p>
          <p className="text-[14px] text-ink-secondary">
            {barangay.municipality}, {barangay.province}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-ground-muted/50 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-primary text-[13px] font-bold text-white"
          >
            {initials}
          </span>
          <p className="leading-tight">
            <span className="block text-[14px] font-semibold">{user.name}</span>
            <span className="block text-[12px] text-ink-secondary">
              {user.position}
            </span>
          </p>
        </div>
        <Link
          href={routes.notifications}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-dash-primary hover:bg-dash-primary-soft"
        >
          <Icon name="bell" className="h-4 w-4" />
          {unread > 0
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : "No unread notifications"}
        </Link>
      </div>
    </header>
  );
}
