import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import RecordPicker from "@/components/dashboard/ui/RecordPicker";
import { isoDay } from "@/lib/dashboard/format";
import { ANIMAL_STATUS, CONDITION, RESOURCE_CATEGORY, SEX, SPECIES, options } from "@/lib/labels";
import { saveAnimal, saveResource } from "@/server/actions/community";

type AnimalRow = {
  id: string;
  tagNo: string;
  species: string;
  name: string | null;
  breed: string | null;
  sex: string | null;
  color: string | null;
  birthYear: number | null;
  ownerResidentId: string | null;
  ownerName: string;
  lastVaccinatedAt: Date | null;
  vaccine: string | null;
  status: string;
  remarks: string | null;
  owner?: { id: string; residentNo: string } | null;
};

export function AnimalDialog({ animal }: { animal?: AnimalRow }) {
  const a = animal;
  return (
    <ActionDialog
      trigger={a ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> Register animal</>}
      triggerClassName={a ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={a ? `Edit ${a.tagNo}` : "Register an animal"}
      description={a ? undefined : "A tag number is assigned when you save."}
      action={saveAnimal}
      hidden={a ? { id: a.id } : undefined}
      confirmLabel={a ? "Save" : "Register"}
      icon="paw"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="species" label="Species" options={options(SPECIES)} defaultValue={a?.species ?? ""} placeholder="Choose" required />
        <Input name="name" label="Name" defaultValue={a?.name ?? ""} />
        <Input name="breed" label="Breed" defaultValue={a?.breed ?? ""} />
        <Input name="color" label="Color / markings" defaultValue={a?.color ?? ""} />
        <Select name="sex" label="Sex" options={options(SEX)} defaultValue={a?.sex ?? ""} placeholder="Unknown" />
        <Input name="birthYear" label="Birth year" type="number" min={1980} max={2100} defaultValue={a?.birthYear ?? ""} />
      </div>
      <RecordPicker name="ownerResidentId" label="Owner (resident)" type="resident" initial={a?.ownerResidentId ? { value: a.ownerResidentId, label: a.ownerName, sub: a.owner?.residentNo } : null} />
      <Input name="ownerName" label="Owner name, if not a resident" defaultValue={a && !a.ownerResidentId ? a.ownerName : ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="lastVaccinatedAt" label="Last vaccinated" type="date" defaultValue={isoDay(a?.lastVaccinatedAt)} />
        <Input name="vaccine" label="Vaccine" defaultValue={a?.vaccine ?? ""} placeholder="Anti-rabies" />
      </div>
      {a && <Select name="status" label="Status" options={options(ANIMAL_STATUS)} defaultValue={a.status} />}
      <Textarea name="remarks" label="Remarks" defaultValue={a?.remarks ?? ""} rows={2} />
    </ActionDialog>
  );
}

type ResourceRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
  location: string | null;
  custodian: string | null;
  acquiredAt: Date | null;
  value: { toString(): string } | null;
  remarks: string | null;
};

export function ResourceDialog({ resource }: { resource?: ResourceRow }) {
  const r = resource;
  return (
    <ActionDialog
      trigger={r ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> Add resource</>}
      triggerClassName={r ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={r ? `Edit ${r.name}` : "Add a community resource"}
      action={saveResource}
      hidden={r ? { id: r.id } : undefined}
      confirmLabel={r ? "Save" : "Add"}
      icon="box"
    >
      <Input name="name" label="Name" defaultValue={r?.name} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category" label="Category" options={options(RESOURCE_CATEGORY)} defaultValue={r?.category ?? ""} placeholder="Choose" required />
        <Select name="condition" label="Condition" options={options(CONDITION)} defaultValue={r?.condition ?? "GOOD"} required />
        <Input name="quantity" label="Quantity" type="number" min={0} defaultValue={r?.quantity ?? 1} required />
        <Input name="unit" label="Unit" defaultValue={r?.unit ?? "unit"} required />
        <Input name="location" label="Location" defaultValue={r?.location ?? ""} />
        <Input name="custodian" label="Custodian" defaultValue={r?.custodian ?? ""} />
        <Input name="acquiredAt" label="Date acquired" type="date" defaultValue={isoDay(r?.acquiredAt)} />
        <Input name="value" label="Value (₱)" type="number" min={0} step="0.01" defaultValue={r?.value?.toString() ?? ""} />
      </div>
      <Textarea name="remarks" label="Remarks" defaultValue={r?.remarks ?? ""} rows={2} />
    </ActionDialog>
  );
}
