import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";

const actions: { label: string; hint: string; icon: IconName; href: string }[] = [
  { label: "Register resident", hint: "Add a person to the records", icon: "userPlus", href: routes.addResident },
  { label: "Add household", hint: "New household and its address", icon: "homePlus", href: routes.newHousehold },
  { label: "Issue certificate", hint: "Clearance, indigency, residency", icon: "fileCheck", href: routes.issueCertificate },
  { label: "Record incident", hint: "New blotter entry", icon: "alert", href: routes.newIncident },
  { label: "Submit report", hint: "Send to the municipality", icon: "send", href: routes.submitReport },
  { label: "Generate report", hint: "Print or export figures", icon: "fileChart", href: routes.generateReport },
];

export default function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {actions.map((a) => (
          <li key={a.label}>
            <Link
              href={a.href}
              className="surface group flex h-full items-center gap-3 p-3.5 transition hover:border-dash-primary/40 hover:shadow-card-hover motion-reduce:transition-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-primary-soft text-dash-primary transition-colors group-hover:bg-brand-fill group-hover:text-white">
                <Icon name={a.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[13.5px] font-semibold">{a.label}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-secondary">{a.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
