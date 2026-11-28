import {
  Bell,
  ChartColumn,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import { Tilt } from "@/components/motion";
import { WavingFlag } from "./PhilippineFlag";

/**
 * Illustration of the Barangay Secretary dashboard, with the municipal network around it.
 * Drawn in HTML so it stays sharp at any size. Decorative: the figures are illustrative.
 */
export default function DashboardMockup() {
  const bars = [42, 58, 50, 72, 64, 88];
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const submissions = [
    { title: "Q4 Barangay Profile", office: "MPDO", status: "Under review", tone: "bg-amber-100 text-amber-800" },
    { title: "Monthly Demographics", office: "MPDO", status: "Approved", tone: "bg-emerald-100 text-emerald-800" },
    { title: "Blotter Summary", office: "MPS", status: "Due in 3 days", tone: "bg-ground-muted text-ink-secondary" },
  ];

  return (
    <div
      role="img"
      aria-label="Illustration of the LGU Connect dashboard, connected to the municipality and its barangays"
      className="relative mx-auto w-full max-w-[560px] select-none"
    >
    <Tilt max={7} rest={{ x: 6, y: -10 }}>
      {/* Back layer: the Philippines map and soft glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-[130%] w-[75%] [transform:translateZ(-90px)]">
        <div className="map-drift h-full w-full bg-brand/[0.13] [mask-image:url(/philippines.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url(/philippines.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
      </div>
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand/20 blur-3xl [transform:translateZ(-60px)]" />
      <div aria-hidden="true" className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-flag-gold/30 blur-3xl [transform:translateZ(-60px)]" />

      {/* Browser window */}
      <div aria-hidden="true" className="relative overflow-hidden rounded-2xl border border-rule bg-panel shadow-[0_2px_4px_rgb(22_25_31/0.04),0_24px_60px_rgb(0_56_168/0.18)]">
        <div className="flex items-center gap-2 border-b border-rule bg-ground-muted px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-flag-red/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-flag-gold" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand/70" />
          <span className="ml-3 flex-1 truncate rounded-md bg-panel px-3 py-1 text-[11px] text-ink-secondary">
            LGU Connect &middot; Dashboard
          </span>
        </div>

        <div className="grid grid-cols-[52px_1fr]">
          {/* Sidebar */}
          <div className="flex flex-col items-center gap-3 bg-[color-mix(in_srgb,var(--color-brand)_92%,black)] py-4 text-white/70">
            <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-flag-gold text-[11px] font-bold text-ink">L</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white"><LayoutDashboard className="h-4 w-4" /></span>
            <Users className="h-4 w-4" />
            <FileText className="h-4 w-4" />
            <ChartColumn className="h-4 w-4" />
            <Megaphone className="h-4 w-4" />
            <Inbox className="h-4 w-4" />
            <Settings2 className="mt-auto h-4 w-4" />
          </div>

          {/* Content */}
          <div className="min-w-0 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold leading-tight">Magandang araw, Maria</p>
                <p className="truncate text-[11px] text-ink-secondary">Barangay Bagong Pook &middot; Pila, Laguna</p>
              </div>
              <div className="flex items-center gap-2 text-ink-secondary">
                <span className="hidden items-center gap-1.5 rounded-md border border-rule px-2 py-1 text-[10px] min-[420px]:flex"><Search className="h-3 w-3" /> Search</span>
                <span className="relative"><Bell className="h-4 w-4" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-flag-red" /></span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Residents", "1,248", "+12"],
                ["Households", "312", "+4"],
                ["Documents", "86", "this month"],
              ].map(([label, value, delta]) => (
                <div key={label} className="rounded-lg border border-rule p-2.5">
                  <p className="text-[10px] text-ink-secondary">{label}</p>
                  <p className="font-display text-lg font-bold leading-tight">{value}</p>
                  <p className="text-[10px] font-medium text-emerald-700">{delta}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-2 min-[480px]:grid-cols-[1.1fr_1fr]">
              <div className="rounded-lg border border-rule p-2.5">
                <p className="text-[10px] font-semibold">Documents issued</p>
                <div className="mt-2 flex h-20 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div key={months[i]} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={`bar-grow w-full rounded-t-[3px] ${i === bars.length - 1 ? "bg-brand" : "bg-brand/25"}`}
                        style={{ height: `${Math.round(h * 0.62)}px`, animationDelay: `${0.9 + i * 0.08}s` }}
                      />
                      <span className="text-[8px] text-ink-secondary">{months[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden rounded-lg border border-rule p-2.5 min-[480px]:block">
                <p className="text-[10px] font-semibold">Submissions</p>
                <ul className="mt-1.5 space-y-1.5">
                  {submissions.map((s) => (
                    <li key={s.title} className="flex items-center justify-between gap-1">
                      <span className="min-w-0">
                        <span className="block truncate text-[10px] font-medium">{s.title}</span>
                        <span className="block text-[9px] text-ink-secondary">{s.office}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${s.tone}`}>{s.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: the municipal network */}
      <div aria-hidden="true" className="absolute -top-11 right-3 hidden [transform:translateZ(70px)] sm:block">
      <div className="float-slow flex items-center gap-3 rounded-xl border border-rule bg-panel/95 py-2.5 pl-2.5 pr-4 shadow-[0_12px_30px_rgb(22_25_31/0.12)] backdrop-blur">
        <svg viewBox="0 0 64 48" className="h-11 w-14">
          {[[10, 10], [10, 38], [54, 10], [54, 38], [32, 44]].map(([x, y]) => (
            <line key={`${x}-${y}`} x1="32" y1="22" x2={x} y2={y} stroke="var(--color-brand)" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
          ))}
          {[[10, 10], [10, 38], [54, 10], [54, 38], [32, 44]].map(([x, y]) => (
            <circle key={`c${x}-${y}`} cx={x} cy={y} r="3.6" fill="var(--color-panel)" stroke="var(--color-brand)" strokeWidth="1.8" />
          ))}
          <circle cx="32" cy="22" r="8.5" fill="var(--color-brand)" />
          <circle cx="32" cy="22" r="3" fill="var(--color-flag-gold)" />
        </svg>
        <span>
          <span className="block text-[11px] font-semibold leading-snug">Municipality of Pila</span>
          <span className="block text-[10px] text-ink-secondary">17 barangays connected</span>
        </span>
      </div>
      </div>

      {/* Floating: the Philippine flag */}
      <div aria-hidden="true" className="absolute -left-10 top-[30%] hidden [transform:translateZ(110px)] sm:block">
        <div className="float-slow rounded-md shadow-[0_14px_30px_rgb(0_56_168/0.3)]">
          <WavingFlag width={104} strips={20} label="" />
        </div>
      </div>

      {/* Floating: a notification */}
      <div aria-hidden="true" className="absolute -bottom-9 -right-2 [transform:translateZ(90px)] sm:-right-8">
      <div className="float-slower flex max-w-[250px] items-start gap-2.5 rounded-xl border border-rule bg-panel p-3 shadow-[0_12px_30px_rgb(22_25_31/0.14)]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3.2 3L13 4.5" /></svg>
        </span>
        <span>
          <span className="block text-[11px] font-semibold leading-snug">MPDO approved your report</span>
          <span className="block text-[10px] text-ink-secondary">Monthly Demographics &middot; just now</span>
        </span>
      </div>
      </div>
    </Tilt>
    </div>
  );
}
