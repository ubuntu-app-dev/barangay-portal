"use client";
import { useState } from "react";
import { Input, Select } from "@/components/dashboard/ui/form";
import RecordPicker from "@/components/dashboard/ui/RecordPicker";

/** Either pick a resident, or type the details of someone from outside the barangay. */
export default function PartyFields({ prefix, label, required }: { prefix: string; label: string; required?: boolean }) {
  const [outsider, setOutsider] = useState(false);
  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold">
          {label}
          {required && <span className="ml-0.5 text-dash-danger">*</span>}
        </p>
        <div role="radiogroup" aria-label={`${label} is`} className="inline-flex rounded-lg bg-ground-muted p-0.5 text-[12.5px] font-semibold">
          {[
            [false, "Resident"],
            [true, "Not a resident"],
          ].map(([v, t]) => (
            <button key={String(v)} type="button" role="radio" aria-checked={outsider === v} onClick={() => setOutsider(v as boolean)} className={`rounded-md px-3 py-1 ${outsider === v ? "bg-panel text-dash-primary shadow-sm" : "text-ink-secondary"}`}>
              {t as string}
            </button>
          ))}
        </div>
      </div>
      {outsider ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name={`${prefix}Name`} label="Full name" required={required} />
          <Input name={`${prefix}Contact`} label="Contact number" />
          <Input name={`${prefix}Address`} label="Address" className="sm:col-span-2" />
          <Input name={`${prefix}Age`} label="Age" type="number" min={0} max={130} />
          <Select
            name={`${prefix}Sex`}
            label="Sex"
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
            placeholder="Not stated"
          />
        </div>
      ) : (
        <RecordPicker name={`${prefix}ResidentId`} label="Resident" type="resident" hint="Name, address, age, and sex are copied from the resident record." />
      )}
    </div>
  );
}
