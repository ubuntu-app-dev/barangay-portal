import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { Input } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import RecordPicker from "@/components/dashboard/ui/RecordPicker";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { ageOf, formatNumber } from "@/lib/dashboard/format";
import { RELATIONSHIP, label } from "@/lib/labels";
import { createFamily } from "@/server/actions/residents";
import { flat, type SearchParams } from "@/server/params";
import { listFamilies } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Family Composition" };

type Props = { searchParams: Promise<SearchParams> };

async function Content({ searchParams }: Props) {
  const session = await requireSession();
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await listFamilies(session, sp);
  const now = new Date();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Resident Management" icon="heart" title="Family Composition" description="Families and their members, grouped under their household. Move members between families from the household page.">
        <ActionDialog trigger={<><Icon name="plus" className="h-4 w-4" /> Add family</>} triggerClassName="btn btn-primary" title="Add a family to a household" action={createFamily} confirmLabel="Add family" icon="heart">
          <RecordPicker name="householdId" label="Household" type="household" required />
          <Input name="name" label="Family name" placeholder="For example, Santos family" required />
        </ActionDialog>
      </PageHeader>
      <Card title={`${formatNumber(total)} famil${total === 1 ? "y" : "ies"}`}>
        <ListToolbar placeholder="Search family name, household no., or surname" />
        {rows.length === 0 ? (
          <EmptyState icon="heart" title="No families found" text="Families are created with each household. Try a different search." />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {rows.map((f) => (
              <li key={f.id} className="rounded-2xl border border-rule/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[15px] font-bold">{f.name}</p>
                    <p className="text-[12.5px] text-ink-secondary">
                      <Link href={`${routes.households}/${f.household.id}`} className="text-dash-primary hover:underline">
                        {f.household.householdNo}
                      </Link>{" "}
                      · {f.household.purok?.name} · {f.household.address}
                    </p>
                  </div>
                  <span className="rounded-full bg-ground-muted px-2.5 py-0.5 text-[12px] font-semibold tabular-nums">{f.members.length}</span>
                </div>
                {f.members.length === 0 ? (
                  <p className="mt-3 text-[13px] text-ink-secondary">No members assigned.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-rule/70">
                    {f.members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 py-1.5 text-[13.5px]">
                        <Link href={`${routes.residents}/${m.id}`} className="font-medium hover:text-dash-primary hover:underline">
                          {m.firstName} {m.lastName}
                        </Link>
                        <span className="text-ink-secondary">
                          {label(RELATIONSHIP, m.relationship) || "Member"} · {ageOf(m.birthDate, now)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} pageSize={pageSize} total={total} params={flat(sp)} basePath={routes.families} />
      </Card>
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
