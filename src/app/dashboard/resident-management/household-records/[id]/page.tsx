import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import ChangeHistory from "@/components/dashboard/ui/ChangeHistory";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Input, Select } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import RecordPicker from "@/components/dashboard/ui/RecordPicker";
import SavedNotice from "@/components/dashboard/ui/SavedNotice";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { ageOf, formatMoney, nameLastFirst } from "@/lib/dashboard/format";
import { RELATIONSHIP, RESIDENT_STATUS, SEX, SPECIES, TENURE, TOILET, WATER, label, options } from "@/lib/labels";
import { addHouseholdMember, assignFamily, createFamily, deleteFamily, deleteHousehold, removeHouseholdMember, renameFamily } from "@/server/actions/residents";
import { str, type SearchParams } from "@/server/params";
import { getHousehold } from "@/server/queries/residents";

export const metadata: Metadata = { title: "Household" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

async function Content({ params, searchParams }: Props) {
  const session = await requireSession();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const h = await getHousehold(session, id);
  const head = h.members.find((m) => m.relationship === "HEAD" && m.status === "ACTIVE");
  const active = h.members.filter((m) => m.status === "ACTIVE");
  const familyOptions = h.families.map((f) => ({ value: f.id, label: f.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: routes.households, label: "Household Records" }}
        eyebrow={h.purok?.name ?? "Household"}
        title={head ? `${h.householdNo} · ${head.lastName} household` : h.householdNo}
        description={`${h.address} · ${active.length} member${active.length === 1 ? "" : "s"}`}
      >
        <Link href={`${routes.addResident}?household=${h.id}`} className="btn btn-secondary">
          <Icon name="userPlus" className="h-4 w-4" /> Register new member
        </Link>
        <Link href={`${routes.households}/${h.id}/edit`} className="btn btn-primary">
          <Icon name="edit" className="h-4 w-4" /> Edit
        </Link>
      </PageHeader>
      <SavedNotice value={str(sp.saved)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card
            title="Members"
            icon="users"
            description="Residents living in this household."
            actions={
              <ActionDialog
                trigger={
                  <>
                    <Icon name="plus" className="h-4 w-4" /> Add existing resident
                  </>
                }
                triggerClassName="btn btn-soft btn-sm"
                title="Add a resident to this household"
                description="If they belong to another household, they are moved here."
                action={addHouseholdMember}
                hidden={{ householdId: h.id }}
                confirmLabel="Add member"
                icon="userPlus"
              >
                <RecordPicker name="residentId" label="Resident" type="resident" required />
                <Select name="relationship" label="Relationship to the head" options={options(RELATIONSHIP)} placeholder="Choose" required />
                {familyOptions.length > 1 && <Select name="familyId" label="Family" options={familyOptions} placeholder="Choose" />}
              </ActionDialog>
            }
          >
            <Table
              caption="Household members"
              rows={h.members}
              rowKey={(m) => m.id}
              empty={{ icon: "users", title: "No members yet", text: "Register a new member or add an existing resident." }}
              cols={[
                { key: "name", header: "Name", cell: (m) => <Cell2 title={nameLastFirst(m)} sub={m.residentNo} href={`${routes.residents}/${m.id}`} /> },
                {
                  key: "rel",
                  header: "Relationship",
                  cell: (m) => (m.relationship === "HEAD" ? <span className="rounded-full bg-brand-fill px-2.5 py-0.5 text-[12px] font-semibold text-white">Head</span> : label(RELATIONSHIP, m.relationship) || "—"),
                },
                { key: "age", header: "Age / Sex", cell: (m) => `${ageOf(m.birthDate)} · ${label(SEX, m.sex)}` },
                { key: "family", header: "Family", cell: (m) => m.family?.name ?? "—", optional: true },
                { key: "status", header: "Status", cell: (m) => (m.status === "ACTIVE" ? "Active" : <StatusBadge status={label(RESIDENT_STATUS, m.status)} />), optional: true },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  cell: (m) => (
                    <div className="flex justify-end gap-1">
                      {h.families.length > 1 && (
                        <ActionDialog
                          trigger="Family"
                          triggerClassName="btn btn-ghost btn-sm"
                          title={`Family of ${m.firstName} ${m.lastName}`}
                          action={assignFamily}
                          hidden={{ residentId: m.id }}
                          confirmLabel="Save"
                        >
                          <Select name="familyId" label="Family" options={familyOptions} defaultValue={m.familyId ?? ""} placeholder="No family" />
                        </ActionDialog>
                      )}
                      <ActionDialog
                        trigger="Remove"
                        triggerClassName="btn btn-ghost btn-sm text-dash-danger"
                        title={`Remove ${m.firstName} ${m.lastName} from ${h.householdNo}?`}
                        description="The resident record stays. Only the link to this household is removed."
                        action={removeHouseholdMember}
                        hidden={{ residentId: m.id }}
                        confirmLabel="Remove"
                        tone="danger"
                        icon="users"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          <Card
            title="Families in this household"
            icon="heart"
            description="A household can hold more than one family (for example, a married child's family)."
            actions={
              <ActionDialog trigger={<><Icon name="plus" className="h-4 w-4" /> Add family</>} triggerClassName="btn btn-soft btn-sm" title="Add a family" action={createFamily} hidden={{ householdId: h.id }} confirmLabel="Add family" icon="heart">
                <Input name="name" label="Family name" placeholder="For example, Santos family" required />
              </ActionDialog>
            }
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {h.families.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-rule/80 p-4">
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-[12.5px] text-ink-secondary">
                      {f._count.members} member{f._count.members === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <ActionDialog trigger="Rename" triggerClassName="btn btn-ghost btn-sm" title="Rename family" action={renameFamily} hidden={{ id: f.id }} confirmLabel="Save">
                      <Input name="name" label="Family name" defaultValue={f.name} required />
                    </ActionDialog>
                    {f._count.members === 0 && (
                      <ActionDialog trigger="Remove" triggerClassName="btn btn-ghost btn-sm text-dash-danger" title={`Remove ${f.name}?`} action={deleteFamily} hidden={{ id: f.id }} confirmLabel="Remove" tone="danger" icon="trash" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Household Details" icon="home">
            <DetailList
              columns={1}
              rows={[
                ["Household no.", h.householdNo],
                ["Purok", h.purok?.name],
                ["Address", h.address],
                ["Tenure", label(TENURE, h.tenure)],
                ["Water source", label(WATER, h.waterSource)],
                ["Toilet", label(TOILET, h.toilet)],
                ["Electricity", h.hasElectricity ? "Yes" : "No"],
                ["Monthly income", h.monthlyIncome ? formatMoney(h.monthlyIncome) : null],
                ["Remarks", h.remarks],
              ]}
            />
          </Card>
          {h.animals.length > 0 && (
            <Card title="Animals" icon="paw">
              <ul className="space-y-1 text-[14px]">
                {h.animals.map((a) => (
                  <li key={a.id}>
                    {a.tagNo} · {label(SPECIES, a.species)}
                    {a.name ? ` (${a.name})` : ""}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Change History" icon="history">
            <ChangeHistory rows={h.history} />
          </Card>
          {h.members.length === 0 && (
            <div className="surface p-5">
              <p className="font-display text-[15px] font-bold">Remove this household</p>
              <p className="mt-1 text-[13px] text-ink-secondary">Only empty households can be removed.</p>
              <div className="mt-3">
                <ActionDialog trigger="Remove household" triggerClassName="btn btn-secondary btn-sm text-dash-danger" title={`Remove ${h.householdNo}?`} action={deleteHousehold} hidden={{ id: h.id }} confirmLabel="Remove" tone="danger" icon="trash" />
              </div>
            </div>
          )}
        </div>
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
