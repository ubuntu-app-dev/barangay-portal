"use client";
import Link from "next/link";
import { ActionForm, FormActions, FormSection, Input, Select, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import RowsEditor from "@/components/dashboard/ui/RowsEditor";
import { routes } from "@/config/navigation";
import type { ActionState } from "@/lib/action-state";
import type { BarangayProfile } from "@/types/profile";

type Action = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function InfoForm({ action, profile }: { action: Action; profile: BarangayProfile }) {
  const g = profile.general;
  const b = profile.boundaries;
  const a = profile.about;
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="General" description="The name, PSGC code, and municipality come from the official PSGC list and cannot be edited here.">
        <Input name="name" label="Barangay name" defaultValue={g.name} readOnly />
        <Input name="code" label="PSGC code" defaultValue={g.code} readOnly />
        <Select name="classification" label="Classification" defaultValue={g.classificationKey} options={[{ value: "URBAN", label: "Urban" }, { value: "RURAL", label: "Rural" }]} required />
        <Input name="landAreaHectares" label="Land area (hectares)" type="number" step="0.01" min={0} defaultValue={g.landAreaHectares ?? ""} />
        <Input name="dateEstablished" label="Date established" type="date" defaultValue={g.dateEstablished ?? ""} />
        <Input name="zipCode" label="ZIP code" inputMode="numeric" maxLength={4} defaultValue={g.zipCode} />
        <Input name="legislativeDistrict" label="Legislative district" defaultValue={g.legislativeDistrict} className="sm:col-span-2" />
      </FormSection>
      <FormSection title="Boundaries" description="Neighboring barangays or landmarks on each side.">
        <Input name="boundaryNorth" label="North" defaultValue={b.north} />
        <Input name="boundaryEast" label="East" defaultValue={b.east} />
        <Input name="boundarySouth" label="South" defaultValue={b.south} />
        <Input name="boundaryWest" label="West" defaultValue={b.west} />
      </FormSection>
      <FormSection title="About the barangay">
        <Textarea name="history" label="History" defaultValue={a.history} rows={5} className="sm:col-span-2" />
        <Textarea name="vision" label="Vision" defaultValue={a.vision} rows={3} className="sm:col-span-2" />
        <Textarea name="mission" label="Mission" defaultValue={a.mission} rows={3} className="sm:col-span-2" />
      </FormSection>
      <FormActions>
        <Link href={routes.profile} className="btn btn-secondary">
          Back to profile
        </Link>
        <SubmitButton>Save information</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function ContactForm({ action, profile }: { action: Action; profile: BarangayProfile }) {
  const c = profile.contact;
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="Barangay hall">
        <Input name="address" label="Address" defaultValue={c.address} required className="sm:col-span-2" />
        <Input name="landline" label="Landline" defaultValue={c.landline} />
        <Input name="mobile" label="Mobile" defaultValue={c.mobile} />
        <Input name="email" label="Email" type="email" defaultValue={c.email} />
        <Input name="facebook" label="Facebook page" defaultValue={c.facebook} placeholder="facebook.com/…" />
      </FormSection>
      <FormSection title="Office hours">
        <div className="sm:col-span-2">
          <RowsEditor name="hours" label="Schedule" addLabel="Add schedule" initial={c.hours} fields={[{ key: "days", label: "Days", placeholder: "Monday to Friday" }, { key: "time", label: "Time", placeholder: "8:00 AM to 5:00 PM" }]} />
        </div>
      </FormSection>
      <FormSection title="Emergency hotlines" description="Shown to residents and on the profile. 911 is highlighted.">
        <div className="sm:col-span-2">
          <RowsEditor
            name="hotlines"
            label="Hotlines"
            addLabel="Add hotline"
            initial={c.hotlines.map((h) => ({ name: h.name, number: h.number, note: h.note ?? "" }))}
            fields={[{ key: "name", label: "Name" }, { key: "number", label: "Number" }, { key: "note", label: "Note (optional)" }]}
          />
        </div>
      </FormSection>
      <FormActions>
        <Link href={routes.contacts} className="btn btn-secondary">
          Back to contacts
        </Link>
        <SubmitButton>Save contact details</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
