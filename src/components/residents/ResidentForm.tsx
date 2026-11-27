"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, Checkbox, FormActions, FormSection, Input, Select, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import RecordPicker, { type PickerOption } from "@/components/dashboard/ui/RecordPicker";
import type { ActionState } from "@/lib/action-state";
import { CIVIL_STATUS, EDUCATION, RELATIONSHIP, RESIDENT_STATUS, SEX, options } from "@/lib/labels";

export type ResidentValues = Partial<{
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: string;
  birthDate: string;
  birthPlace: string;
  civilStatus: string;
  citizenship: string;
  religion: string;
  occupation: string;
  education: string;
  contactNumber: string;
  email: string;
  philsysNo: string;
  purokId: string;
  address: string;
  residentSince: string;
  relationship: string;
  isRegisteredVoter: boolean;
  voterPrecinct: string;
  isPwd: boolean;
  disability: string;
  isSoloParent: boolean;
  is4Ps: boolean;
  isIndigenous: boolean;
  isOfw: boolean;
  isOutOfSchoolYouth: boolean;
  seniorIdNo: string;
  status: string;
  remarks: string;
}>;

type Props = {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  puroks: { id: string; name: string }[];
  values?: ResidentValues;
  household?: PickerOption | null;
  cancelHref: string;
  mode: "create" | "edit";
};

export default function ResidentForm({ action, puroks, values = {}, household = null, cancelHref, mode }: Props) {
  const [hh, setHh] = useState<PickerOption | null>(household);
  const [voter, setVoter] = useState(!!values.isRegisteredVoter);
  const [pwd, setPwd] = useState(!!values.isPwd);
  const v = values;
  return (
    <ActionForm action={action} hidden={v.id ? { id: v.id } : undefined} className="surface p-5 sm:p-7">
      <FormSection title="Personal information" description="As written on a birth certificate or valid ID.">
        <Input name="firstName" label="First name" defaultValue={v.firstName} required autoComplete="off" />
        <Input name="middleName" label="Middle name" defaultValue={v.middleName} autoComplete="off" />
        <Input name="lastName" label="Last name" defaultValue={v.lastName} required autoComplete="off" />
        <Input name="suffix" label="Suffix" defaultValue={v.suffix} placeholder="Jr., Sr., III" />
        <Select name="sex" label="Sex" defaultValue={v.sex ?? ""} options={options(SEX)} placeholder="Choose" required />
        <Input name="birthDate" label="Birth date" type="date" defaultValue={v.birthDate} required />
        <Input name="birthPlace" label="Birth place" defaultValue={v.birthPlace} placeholder="City or municipality, province" />
        <Select name="civilStatus" label="Civil status" defaultValue={v.civilStatus ?? "SINGLE"} options={options(CIVIL_STATUS)} required />
        <Input name="citizenship" label="Citizenship" defaultValue={v.citizenship ?? "Filipino"} />
        <Input name="religion" label="Religion" defaultValue={v.religion} />
        <Select name="education" label="Highest education" defaultValue={v.education ?? ""} options={options(EDUCATION)} placeholder="Not set" />
        <Input name="occupation" label="Occupation" defaultValue={v.occupation} />
      </FormSection>

      <FormSection title="Contact and IDs">
        <Input name="contactNumber" label="Mobile number" defaultValue={v.contactNumber} inputMode="tel" placeholder="0917 123 4567" />
        <Input name="email" label="Email" type="email" defaultValue={v.email} />
        <Input name="philsysNo" label="PhilSys (National ID) number" defaultValue={v.philsysNo} className="sm:col-span-2" hint="Optional. Only record it with the resident's consent." />
      </FormSection>

      <FormSection title="Address and household" description="Choosing a household fills in its address when you save.">
        <Select name="purokId" label="Purok" defaultValue={v.purokId ?? ""} options={puroks.map((p) => ({ value: p.id, label: p.name }))} placeholder="Choose a purok" />
        <Input name="residentSince" label="Resident since (year)" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={v.residentSince} />
        <Input name="address" label="House no. and street" defaultValue={v.address} required className="sm:col-span-2" />
        <RecordPicker name="householdId" label="Household" type="household" initial={hh} onChange={setHh} className="sm:col-span-2" hint="Leave empty if the household is not registered yet." />
        {hh && (
          <Select name="relationship" label="Relationship to the household head" defaultValue={v.relationship ?? ""} options={options(RELATIONSHIP)} placeholder="Choose" required className="sm:col-span-2" />
        )}
      </FormSection>

      <FormSection title="Classification" description="Used for reports and assistance programs. Tick all that apply.">
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          <Checkbox name="isRegisteredVoter" label="Registered voter" defaultChecked={v.isRegisteredVoter} onChange={setVoter} />
          <Checkbox name="isPwd" label="Person with disability (PWD)" defaultChecked={v.isPwd} onChange={setPwd} />
          <Checkbox name="isSoloParent" label="Solo parent" defaultChecked={v.isSoloParent} />
          <Checkbox name="is4Ps" label="4Ps beneficiary" defaultChecked={v.is4Ps} />
          <Checkbox name="isOutOfSchoolYouth" label="Out-of-school youth" hint="15 to 24 years old" defaultChecked={v.isOutOfSchoolYouth} />
          <Checkbox name="isOfw" label="Overseas Filipino worker" defaultChecked={v.isOfw} />
          <Checkbox name="isIndigenous" label="Member of an indigenous group" defaultChecked={v.isIndigenous} />
        </div>
        {voter && <Input name="voterPrecinct" label="Precinct number" defaultValue={v.voterPrecinct} />}
        {pwd && <Input name="disability" label="Type of disability" defaultValue={v.disability} required />}
        <Input name="seniorIdNo" label="Senior citizen (OSCA) ID" defaultValue={v.seniorIdNo} hint="Residents aged 60 and above are counted as seniors automatically." />
      </FormSection>

      <FormSection title="Other">
        {mode === "edit" && (
          <Select name="status" label="Record status" defaultValue={v.status ?? "ACTIVE"} options={options(RESIDENT_STATUS)} hint="Moved out and deceased residents leave the active lists but keep their history." />
        )}
        <Textarea name="remarks" label="Remarks" defaultValue={v.remarks} rows={3} className="sm:col-span-2" />
        {mode === "create" && (
          <Checkbox name="allowDuplicate" label="This is a different person" hint="Only tick this if the system warns about a resident with the same name and birth date." className="sm:col-span-2" />
        )}
      </FormSection>

      <FormActions>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
        <SubmitButton>{mode === "create" ? "Register resident" : "Save changes"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
