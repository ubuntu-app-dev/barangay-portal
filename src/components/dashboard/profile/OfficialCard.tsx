import Icon from "@/components/dashboard/ui/Icon";
import type { Official } from "@/types/profile";

export const initialsOf = (name: string) => name.replace(/^Hon\.\s*/, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export function OfficialCard({ official: o }: { official: Official }) {
  return (
    <li className="rounded-2xl border border-rule bg-panel p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-display text-[15px] font-bold text-brand">{initialsOf(o.name)}</span>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold">{o.name}</p>
          <p className="text-[13px] text-ink-secondary">{o.position}</p>
        </div>
      </div>
      <dl className="mt-3 space-y-1.5 border-t border-rule pt-3 text-[13px]">
        {o.committee && <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Committee</dt><dd className="text-right font-semibold">{o.committee}</dd></div>}
        <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Term</dt><dd className="text-right font-semibold">{o.term}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Contact</dt><dd className="text-right font-semibold"><a href={telHref(o.contact)} className="inline-flex items-center gap-1 text-brand hover:underline"><Icon name="phone" className="h-3.5 w-3.5" />{o.contact}</a></dd></div>
      </dl>
    </li>
  );
}

/** The Punong Barangay, shown larger than everyone else. */
export function FeaturedOfficial({ official: o }: { official: Official }) {
  return (
    <section aria-label="Punong Barangay" className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-sm sm:p-8">
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 flex h-1.5 w-full"><span className="flex-[2] bg-white/30" /><span className="flex-1 bg-flag-red" /><span className="flex-1 bg-flag-gold" /></div>
      <div className="relative flex flex-wrap items-center gap-5">
        <span aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white font-display text-2xl font-bold text-brand">{initialsOf(o.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold"><Icon name="star" className="h-3.5 w-3.5" />Punong Barangay (Barangay Captain)</p>
          <h2 className="mt-2 font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-[-0.02em]">{o.name}</h2>
          <p className="text-[14px] text-white/85">{o.term}</p>
        </div>
        <a href={telHref(o.contact)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-brand hover:bg-white/90"><Icon name="phone" className="h-4 w-4" />{o.contact}</a>
      </div>
    </section>
  );
}
