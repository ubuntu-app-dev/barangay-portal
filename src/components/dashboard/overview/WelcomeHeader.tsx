import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import LiveClock from "@/components/dashboard/shell/LiveClock";
import { routes } from "@/config/navigation";
import type { Session } from "@/types/dashboard";

/** The flag-blue hero at the top of the overview. */
export default function WelcomeHeader({ session, unread, tasks }: { session: Session; unread: number; tasks: number }) {
  const { user, barangay } = session;
  return (
    <header className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#0038a8_0%,#0b46c2_55%,#2a62d9_100%)] text-white shadow-[0_18px_40px_rgb(0_56_168/0.25)]">
      {/* Decorative sun rays and stars, in the spirit of the flag. */}
      <svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] text-white/[0.07]">
        <g transform="translate(200 200)" fill="currentColor">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} transform={`rotate(${i * 45})`} d="M-10 -60 L0 -190 L10 -60 Z" />
          ))}
          <circle r="54" />
        </g>
      </svg>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1">
        <span className="flex-[3] bg-white/20" />
        <span className="flex-1 bg-flag-red" />
        <span className="flex-1 bg-dash-gold" />
      </div>
      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[12px] font-semibold backdrop-blur">
            <Icon name="mapPin" className="h-3.5 w-3.5" />
            {barangay.name} · {barangay.municipality}, {barangay.province}
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-bold leading-tight tracking-[-0.02em]">
            Magandang araw, {user.firstName}!
          </h1>
          <p className="mt-2 max-w-[56ch] text-[15px] text-white/80">
            Here&rsquo;s what is happening in your barangay today. You have{" "}
            <strong className="text-white">
              {tasks} task{tasks === 1 ? "" : "s"}
            </strong>{" "}
            that need attention.
          </p>
          <div className="mt-5 [&_*]:!text-white/85">
            <LiveClock />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 lg:justify-end">
          <Link href={routes.addResident} className="btn btn-gold">
            <Icon name="userPlus" className="h-4 w-4" /> Register resident
          </Link>
          <Link href={routes.issueCertificate} className="btn border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
            <Icon name="fileCheck" className="h-4 w-4" /> Issue certificate
          </Link>
          <Link href={routes.notifications} className="btn border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
            <Icon name="bell" className="h-4 w-4" />
            {unread > 0 ? `${unread} unread` : "Notifications"}
          </Link>
        </div>
      </div>
    </header>
  );
}
