"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, Checkbox, FormActions, FormSection, Input, Select, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import type { ActionState } from "@/lib/action-state";
import { BLOTTER_CATEGORIES } from "@/lib/defaults";
import PartyFields from "./PartyFields";

type Props = {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  puroks: { id: string; name: string }[];
  initialKind: "INCIDENT" | "COMPLAINT";
  canVawc: boolean;
  initialVawc?: boolean;
  cancelHref: string;
};

/** Local date-time for <input type="datetime-local">, in Philippine time. */
const nowLocal = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 16);

export default function BlotterForm({ action, puroks, initialKind, canVawc, initialVawc = false, cancelHref }: Props) {
  const [kind, setKind] = useState(initialKind);
  const [vawc, setVawc] = useState(initialVawc);
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="What happened" description="Write it the way the complainant told it. You can correct details later; every change is logged.">
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[13px] font-semibold">Type of entry</p>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["INCIDENT", "Incident report", "Something happened and is recorded for the barangay's knowledge."],
                ["COMPLAINT", "Complaint", "One party complains against another. Can go to the Lupon."],
              ] as const
            ).map(([k, t, d]) => (
              <label key={k} className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 ${kind === k ? "border-dash-primary bg-dash-primary-soft/60" : "border-rule hover:border-[#c3c8d2]"}`}>
                <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="mt-1 accent-[var(--dash-primary)]" />
                <span>
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="block text-[12.5px] text-ink-secondary">{d}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <Select name="category" label="Category" options={BLOTTER_CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="Choose" required />
        <Input name="incidentAt" label="Date and time it happened" type="datetime-local" defaultValue={nowLocal()} required />
        <Input name="title" label="Short title" placeholder="For example, Stolen bicycle at the basketball court" required className="sm:col-span-2" />
        <Input name="location" label="Where" placeholder="Street or landmark" required />
        <Select name="purokId" label="Purok" options={puroks.map((p) => ({ value: p.id, label: p.name }))} placeholder="Not in a purok / unknown" />
        <Textarea name="narrative" label="Narrative" rows={6} required className="sm:col-span-2" />
        {canVawc && (
          <Checkbox
            name="isVawc"
            label="VAWC case (RA 9262): confidential"
            hint="Only users with VAWC access can see it. It will not appear in general lists or reports."
            defaultChecked={initialVawc}
            onChange={setVawc}
            className="sm:col-span-2"
          />
        )}
      </FormSection>
      <FormSection title={vawc ? "Victim" : "Complainant"} description="The person reporting.">
        <PartyFields prefix="complainant" label={vawc ? "Victim" : "Complainant"} required />
        <Textarea name="complainantStatement" label="Statement (optional)" rows={3} className="sm:col-span-2" />
      </FormSection>
      <FormSection title="Respondent" description={kind === "COMPLAINT" ? "The person complained against. Required for complaints." : "Optional for incident reports."}>
        <PartyFields prefix="respondent" label="Respondent" required={kind === "COMPLAINT"} />
      </FormSection>
      <FormSection title="Action taken">
        <Textarea name="actionTaken" label="What the barangay did" placeholder="For example, tanod responded and advised both parties" rows={3} className="sm:col-span-2" />
      </FormSection>
      <FormActions>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
        <SubmitButton>Record {kind === "COMPLAINT" ? "complaint" : "incident"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
