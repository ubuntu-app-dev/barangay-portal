import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Help and Support" };

const GUIDES: { icon: IconName; title: string; href: string; steps: string[] }[] = [
  {
    icon: "userPlus",
    title: "Register a resident",
    href: routes.addResident,
    steps: ["Add the household first if it is new (Households → Add household).", "Open Add New Resident and fill in the required fields.", "Pick the household and the relationship to its head.", "Tick the classifications that apply (voter, PWD, solo parent, 4Ps)."],
  },
  {
    icon: "fileCheck",
    title: "Issue a certificate",
    href: routes.issueCertificate,
    steps: ["Open Certificate Issuance, or click Issue on a request.", "Pick the document and the resident, and type the purpose.", "Enter the O.R. number if there is a fee, check the preview, then Issue.", "Print. Each print is counted; voided documents cannot be printed again."],
  },
  {
    icon: "shield",
    title: "Record an incident or complaint",
    href: routes.newIncident,
    steps: ["Choose Incident report or Complaint.", "Add the complainant (a resident, or type the name of an outsider).", "Complaints need a respondent. Save to get a blotter number.", "From the entry, file it as a KP case to start the 15-day mediation period."],
  },
  {
    icon: "send",
    title: "Submit a report to the municipality",
    href: routes.pendingSubmissions,
    steps: ["Open Pending Submissions to see what is due.", "Click Prepare. The figures are generated from your records.", "Add notes for anything unusual, then submit.", "If it is returned, read the remarks, fix your records, and resubmit."],
  },
];

const FAQ: [string, string][] = [
  ["I forgot my password.", "Ask your municipal IT administrator to reset it. For security, passwords cannot be recovered by email yet."],
  ["I registered a resident twice.", "Open the duplicate record and use Archive with the reason “duplicate of R-…”. It stays in the change history."],
  ["A certificate has a wrong name.", "Void it from Issuance History with the reason, correct the resident record, then issue a new one."],
  ["Why can't I see VAWC records?", "VAWC cases are confidential under RA 9262. Only the designated VAW desk officer gets access, granted by the municipal IT administrator."],
  ["Who can see my barangay's records?", "Only accounts assigned to your barangay. The municipality sees only the reports you submit."],
  ["Can I change the certificate fees?", "Yes: open the certificate's page and click Fee and requirements. Follow your barangay's approved schedule of fees."],
];

async function Content() {
  const session = await requireSession();
  const admins = await db.user.findMany({ where: { role: "MUNICIPAL_ADMIN", municipalityCode: session.barangay.municipalityCode, status: "ACTIVE" }, select: { firstName: true, lastName: true, email: true, phone: true, position: true } });
  return (
    <div className="space-y-6">
      <PageHeader icon="help" title="Help and Support" description="Short guides for the everyday tasks, and who to contact when something is wrong." />
      <div className="grid gap-4 md:grid-cols-2">
        {GUIDES.map((g) => (
          <Card key={g.title} title={g.title} icon={g.icon} actionLabel="Open" actionHref={g.href}>
            <ol className="space-y-2">
              {g.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-[14px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dash-primary-soft text-[12px] font-bold text-dash-primary">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card title="Common questions" icon="info">
          <div className="divide-y divide-rule/70">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {q}
                  <Icon name="chevronDown" className="h-4 w-4 text-ink-secondary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[14px] text-ink-secondary">{a}</p>
              </details>
            ))}
          </div>
        </Card>
        <Card title="Your municipal IT administrator" icon="key">
          {admins.length === 0 ? (
            <p className="text-[14px] text-ink-secondary">No administrator is assigned yet. Contact your municipal hall.</p>
          ) : (
            <ul className="space-y-3">
              {admins.map((a) => (
                <li key={`${a.firstName}${a.lastName}`} className="rounded-xl bg-ground-muted/70 p-3 text-[14px]">
                  <p className="font-semibold">
                    {a.firstName} {a.lastName}
                  </p>
                  {a.position && <p className="text-ink-secondary">{a.position}</p>}
                  {a.email && (
                    <a href={`mailto:${a.email}`} className="mt-1 flex items-center gap-1.5 text-dash-primary hover:underline">
                      <Icon name="mail" className="h-3.5 w-3.5" /> {a.email}
                    </a>
                  )}
                  {a.phone && (
                    <p className="flex items-center gap-1.5">
                      <Icon name="phone" className="h-3.5 w-3.5" /> {a.phone}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[12.5px] text-ink-secondary">
            They handle accounts, password resets, and access to restricted sections. For your own details, see{" "}
            <Link href={routes.accountProfile} className="font-semibold text-dash-primary hover:underline">
              Account Profile
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}
