import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Checkbox, Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import { OFFICIAL_POSITIONS } from "@/lib/defaults";
import { deleteBody, deleteOfficial, deletePurok, saveBody, saveOfficial, savePurok } from "@/server/actions/profile";
import type { BarangayBody, Official, PurokRow } from "@/types/profile";

const positions = OFFICIAL_POSITIONS.filter((p) => p !== "Other").map((p) => ({ value: p, label: p }));

export function OfficialDialog({ official }: { official?: Official }) {
  const o = official;
  const custom = o && !positions.some((p) => p.value === o.position);
  return (
    <ActionDialog
      trigger={
        o ? (
          <>
            <Icon name="edit" className="h-3.5 w-3.5" /> Edit
          </>
        ) : (
          <>
            <Icon name="plus" className="h-4 w-4" /> Add official
          </>
        )
      }
      triggerClassName={o ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={o ? `Edit ${o.name}` : "Add an official"}
      action={saveOfficial}
      hidden={o ? { id: o.id } : undefined}
      confirmLabel={o ? "Save" : "Add official"}
      icon="user"
    >
      <Input name="name" label="Full name" defaultValue={o?.name} placeholder="Hon. Juan D. Dela Cruz" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="position" label="Position" defaultValue={o?.position ?? ""} options={custom ? [...positions, { value: o!.position, label: o!.position }] : positions} placeholder="Choose" required />
        <Input name="committee" label="Committee" defaultValue={o?.committee} />
        <Input name="termStart" label="Term starts" type="date" defaultValue={o?.termStart} />
        <Input name="termEnd" label="Term ends" type="date" defaultValue={o?.termEnd} />
        <Input name="contact" label="Contact number" defaultValue={o?.contact} />
        <Input name="email" label="Email" type="email" defaultValue={o?.email} />
      </div>
      <Checkbox name="isSignatory" label="Signs certificates" hint="Printed as the signatory on documents. Only one official at a time." defaultChecked={o?.isSignatory} />
      {o && <Checkbox name="isActive" label="Currently in office" hint="Untick when the term ends. The record stays in history." defaultChecked={o.isActive} />}
    </ActionDialog>
  );
}

export function RemoveOfficial({ official }: { official: Official }) {
  return (
    <ActionDialog
      trigger={<Icon name="trash" className="h-3.5 w-3.5" />}
      triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger"
      title={`Remove ${official.name}?`}
      description="Use this only for entries made by mistake. For officials whose term ended, edit them and untick “Currently in office”."
      action={deleteOfficial}
      hidden={{ id: official.id }}
      confirmLabel="Remove"
      tone="danger"
      icon="trash"
    />
  );
}

export function BodyDialog({ body }: { body?: BarangayBody }) {
  const b = body;
  return (
    <ActionDialog
      trigger={
        b ? (
          <>
            <Icon name="edit" className="h-3.5 w-3.5" /> Edit
          </>
        ) : (
          <>
            <Icon name="plus" className="h-4 w-4" /> Add council
          </>
        )
      }
      triggerClassName={b ? "btn btn-ghost btn-sm" : "btn btn-soft btn-sm"}
      title={b ? `Edit ${b.name}` : "Add a council or body"}
      action={saveBody}
      hidden={b ? { id: b.id } : undefined}
      confirmLabel={b ? "Save" : "Add"}
      icon="sitemap"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="acronym" label="Short name" defaultValue={b?.name} placeholder="BADAC" required />
        <Input name="memberCount" label="Members" type="number" min={0} defaultValue={b?.members ?? 0} required />
      </div>
      <Input name="name" label="Full name" defaultValue={b?.fullName} required />
      <Input name="head" label="Headed by" defaultValue={b?.head} placeholder="Punong Barangay" />
      <Textarea name="description" label="Description" defaultValue={b?.description} rows={2} />
      <Checkbox name="isActive" label="Active" hint="Untick while the body is being reorganized." defaultChecked={b ? b.status === "Active" : true} />
    </ActionDialog>
  );
}

export function RemoveBody({ body }: { body: BarangayBody }) {
  return <ActionDialog trigger={<Icon name="trash" className="h-3.5 w-3.5" />} triggerClassName="btn btn-ghost btn-sm px-2 text-dash-danger" title={`Remove ${body.name}?`} action={deleteBody} hidden={{ id: body.id }} confirmLabel="Remove" tone="danger" icon="trash" />;
}

export function PurokDialog({ purok }: { purok?: PurokRow }) {
  return (
    <ActionDialog
      trigger={purok ? "Rename" : <><Icon name="plus" className="h-4 w-4" /> Add purok</>}
      triggerClassName={purok ? "btn btn-ghost btn-sm" : "btn btn-soft btn-sm"}
      title={purok ? `Rename ${purok.name}` : "Add a purok or zone"}
      action={savePurok}
      hidden={purok ? { id: purok.id } : undefined}
      confirmLabel="Save"
      icon="mapPin"
    >
      <Input name="name" label="Name" defaultValue={purok?.name} placeholder="Purok 7" required />
    </ActionDialog>
  );
}

export function RemovePurok({ purok }: { purok: PurokRow }) {
  return <ActionDialog trigger="Remove" triggerClassName="btn btn-ghost btn-sm text-dash-danger" title={`Remove ${purok.name}?`} description="Only puroks without residents or households can be removed." action={deletePurok} hidden={{ id: purok.id }} confirmLabel="Remove" tone="danger" icon="trash" />;
}
