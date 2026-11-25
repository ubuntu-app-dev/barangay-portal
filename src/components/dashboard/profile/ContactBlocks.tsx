import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import type { BarangayProfile } from "@/types/profile";

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export function ContactItem({ icon, label, value, href, wide = false }: { icon: IconName; label: string; value: string; href?: string; wide?: boolean }) {
  return (
    <li className={`flex items-start gap-3 rounded-2xl bg-ground-muted/70 p-4 ${wide ? "md:col-span-2" : ""}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon name={icon} /></span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-ink-secondary">{label}</p>
        {href ? <a href={href} className="break-words text-[14px] font-semibold text-brand hover:underline">{value}</a> : <p className="break-words text-[14px] font-semibold">{value}</p>}
      </div>
    </li>
  );
}

export function OfficeHours({ hours }: { hours: BarangayProfile["contact"]["hours"] }) {
  return (
    <ul className="divide-y divide-rule">
      {hours.map((h) => (
        <li key={h.days} className="py-3 first:pt-0 last:pb-0">
          <p className="text-[14px] font-semibold">{h.days}</p>
          <p className="text-[14px] text-ink-secondary">{h.time}</p>
        </li>
      ))}
    </ul>
  );
}

export function HotlineList({ hotlines }: { hotlines: BarangayProfile["contact"]["hotlines"] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {hotlines.map((h) => {
        const national = h.number === "911";
        return (
          <li key={h.name}>
            <a href={telHref(h.number)} className={`flex h-full items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${national ? "border-flag-red/40 bg-flag-red/5" : "border-rule bg-panel"}`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${national ? "bg-flag-red text-white" : "bg-brand/10 text-brand"}`}><Icon name="phone" /></span>
              <span className="block min-w-0">
                <span className="block text-[13px] text-ink-secondary">{h.name}</span>
                <span className={`block font-display text-xl font-bold tabular-nums ${national ? "text-flag-red" : ""}`}>{h.number}</span>
                {h.note && <span className="block text-[12px] text-ink-secondary">{h.note}</span>}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
