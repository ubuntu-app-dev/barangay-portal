"use client";
import Link from "next/link";
import { ActionForm, Checkbox, FormActions, FormSection, Input, Select, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import type { ActionState } from "@/lib/action-state";
import { TENURE, TOILET, WATER, options } from "@/lib/labels";

export type HouseholdValues = Partial<{
  id: string;
  purokId: string;
  address: string;
  tenure: string;
  waterSource: string;
  toilet: string;
  hasElectricity: boolean;
  monthlyIncome: string;
  remarks: string;
}>;

type Props = {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  puroks: { id: string; name: string }[];
  values?: HouseholdValues;
  cancelHref: string;
  mode: "create" | "edit";
};

export default function HouseholdForm({ action, puroks, values = {}, cancelHref, mode }: Props) {
  const v = values;
  return (
    <ActionForm action={action} hidden={v.id ? { id: v.id } : undefined} className="surface p-5 sm:p-7">
      <FormSection title="Location" description="Members' addresses follow the household.">
        <Select name="purokId" label="Purok" defaultValue={v.purokId ?? ""} options={puroks.map((p) => ({ value: p.id, label: p.name }))} placeholder="Choose a purok" required />
        <Select name="tenure" label="Tenure" defaultValue={v.tenure ?? "OWNED"} options={options(TENURE)} required />
        <Input name="address" label="House no. and street" defaultValue={v.address} required className="sm:col-span-2" />
      </FormSection>
      <FormSection title="Utilities and sanitation" description="Feeds the Water Service Classification and household reports.">
        <Select name="waterSource" label="Main water source" defaultValue={v.waterSource ?? "LEVEL_III"} options={options(WATER)} required className="sm:col-span-2" />
        <Select name="toilet" label="Toilet facility" defaultValue={v.toilet ?? "WATER_SEALED"} options={options(TOILET)} required />
        <div className="self-end">
          <Checkbox name="hasElectricity" label="Has electricity" defaultChecked={v.hasElectricity ?? true} />
        </div>
      </FormSection>
      <FormSection title="Other">
        <Input name="monthlyIncome" label="Estimated monthly income (₱)" type="number" inputMode="decimal" min={0} step="100" defaultValue={v.monthlyIncome} hint="Optional, used for assistance programs." />
        <Textarea name="remarks" label="Remarks" defaultValue={v.remarks} rows={3} className="sm:col-span-2" />
      </FormSection>
      <FormActions>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
        <SubmitButton>{mode === "create" ? "Add household" : "Save changes"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
