import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import { ActionForm, SubmitButton } from "@/components/dashboard/ui/form";
import { requireRole } from "@/lib/auth/staff";
import { formatDateTime, formatNumber } from "@/lib/dashboard/format";
import { importMunicipality, setMunicipalityActive } from "@/server/actions/superadmin";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Municipality" };

type Props = { params: Promise<{ code: string }> };

async function Content({ params }: Props) {
  await requireRole("SUPERADMIN");
  const { code } = await params;
  const m = await db.municipality.findUnique({
    where: { code },
    include: {
      province: true,
      region: true,
      offices: { orderBy: { name: "asc" } },
      users: { where: { role: "MUNICIPAL_ADMIN" }, orderBy: { lastName: "asc" } },
      barangays: { select: { isActive: true } },
    },
  });
  if (!m) notFound();
  const [residents, accounts] = await Promise.all([
    db.resident.count({ where: { barangay: { municipalityCode: code }, deletedAt: null } }),
    db.user.count({ where: { status: "ACTIVE", OR: [{ municipalityCode: code }, { barangay: { municipalityCode: code } }] } }),
  ]);
  const onboarded = m.barangays.filter((b) => b.isActive).length;
  return (
    <div className="space-y-6">
      <PageHeader back={{ href: "/superadmin/municipalities", label: "Municipalities" }} eyebrow={`PSGC ${m.code}`} title={m.name} description={`${m.province?.name ?? "No province"} · ${m.region.name}`}>
        {m.isActive ? (
          <ActionDialog trigger="Deactivate" triggerClassName="btn btn-secondary text-dash-danger" title={`Deactivate ${m.name}?`} description="Everyone in it is signed out and cannot sign in. Records are kept." action={setMunicipalityActive} hidden={{ code: m.code, active: "false" }} confirmLabel="Deactivate" tone="danger" icon="lock" reason={{ label: "Reason", required: true }} />
        ) : (
          <ActionDialog trigger="Reactivate" triggerClassName="btn btn-primary" title={`Reactivate ${m.name}?`} action={setMunicipalityActive} hidden={{ code: m.code, active: "true" }} confirmLabel="Reactivate" icon="checkCircle" />
        )}
        <Link href="/superadmin/administrators/new" className="btn btn-primary">
          <Icon name="userPlus" className="h-4 w-4" /> New IT admin
        </Link>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Summary" icon="info" actions={<StatusBadge status={m.isActive ? "Active" : "Inactive"} />}>
          <DetailList
            columns={1}
            rows={[
              ["Type", m.isCity ? "City" : "Municipality"],
              ["Barangays onboarded", `${onboarded} of ${m.barangays.length}`],
              ["Residents on record", formatNumber(residents)],
              ["Active accounts", formatNumber(accounts)],
              ["Loaded", formatDateTime(m.createdAt.toISOString())],
            ]}
          />
          <ActionForm action={importMunicipality} hidden={{ region: m.regionCode, ...(m.provinceCode ? { province: m.provinceCode } : { province: m.code }), municipality: m.code }} className="mt-4 border-t border-rule pt-4">
            <SubmitButton variant="secondary" pendingText="Refreshing…" className="w-full">
              <Icon name="refresh" className="h-4 w-4" /> Refresh barangays from PSGC
            </SubmitButton>
          </ActionForm>
        </Card>
        <Card title="IT administrators" icon="key">
          {m.users.length === 0 ? (
            <EmptyState icon="key" title="No administrator yet" text="Create one so the municipality can onboard its barangays." />
          ) : (
            <ul className="divide-y divide-rule/70">
              {m.users.map((u) => (
                <li key={u.id}>
                  <Link href={`/superadmin/administrators/${u.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-dash-primary">
                    <span>
                      <span className="block font-semibold">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="text-[12.5px] text-ink-secondary">{u.username}</span>
                    </span>
                    <StatusBadge status={u.status === "ACTIVE" ? "Active" : "Inactive"} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Offices" icon="sitemap" description="Managed by the municipal IT admin.">
          <ul className="space-y-1.5 text-[13.5px]">
            {m.offices.map((o) => (
              <li key={o.id} className={o.isActive ? "" : "text-ink-secondary line-through"}>
                {o.name}
                {o.acronym ? ` (${o.acronym})` : ""}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
