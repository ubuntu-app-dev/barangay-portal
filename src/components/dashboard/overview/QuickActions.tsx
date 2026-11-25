import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";

const actions: { label: string; icon: IconName; href: string }[] = [
  {
    label: "Register New Resident",
    icon: "userPlus",
    href: routes.addResident,
  },
  { label: "Add Household", icon: "homePlus", href: routes.households },
  {
    label: "Issue Certificate",
    icon: "fileCheck",
    href: routes.issueCertificate,
  },
  { label: "Record New Incident", icon: "alert", href: routes.newIncident },
  { label: "Submit Municipal Report", icon: "send", href: routes.submitReport },
  {
    label: "Generate Barangay Report",
    icon: "fileChart",
    href: routes.generateReport,
  },
];

export default function QuickActions() {
  return (
    <Card title="Quick Actions">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {actions.map((a) => (
          <li key={a.label}>
            <Link
              href={a.href}
              className="flex h-full flex-col items-center gap-2 rounded-xl border border-rule bg-panel px-3 py-4 text-center text-[14px] font-semibold transition hover:border-dash-primary hover:bg-dash-primary-soft motion-reduce:transition-none"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dash-primary text-white">
                <Icon name={a.icon} />
              </span>
              {a.label}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
