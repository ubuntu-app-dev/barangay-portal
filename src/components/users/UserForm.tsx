"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, Checkbox, FormActions, FormSection, Input, Select, SubmitButton } from "@/components/dashboard/ui/form";
import type { ActionState } from "@/lib/action-state";

type Opt = { value: string; label: string };
type Props = {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  roles: Opt[];
  barangays: Opt[];
  offices: Opt[];
  municipalities: Opt[];
  cancelHref: string;
  v?: Partial<{ id: string; role: string; username: string; firstName: string; middleName: string; lastName: string; position: string; email: string; phone: string; barangayCode: string; officeId: string; municipalityCode: string; vawc: boolean }>;
};

/** Create or edit an account. The scope field (barangay, office, or municipality) follows the role. */
export default function UserForm({ action, mode, roles, barangays, offices, municipalities, cancelHref, v = {} }: Props) {
  const [role, setRole] = useState(v.role ?? roles[0]?.value ?? "");
  return (
    <ActionForm action={action} hidden={v.id ? { id: v.id } : undefined} resetOnSuccess={mode === "create"} className="surface p-5 sm:p-7">
      <FormSection title="Role and assignment" description="What the person can open is decided by the role and where they are assigned.">
        {mode === "create" ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold">Role</span>
            <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="field">
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <Input name="roleLabel" label="Role" defaultValue={roles.find((r) => r.value === role)?.label ?? role} readOnly className="sm:col-span-2" />
        )}
        {role === "BARANGAY_SECRETARY" && <Select name="barangayCode" label="Barangay" options={barangays} defaultValue={v.barangayCode ?? ""} placeholder="Choose an onboarded barangay" required className="sm:col-span-2" />}
        {role === "MUNICIPAL_PERSONNEL" && <Select name="officeId" label="Office" options={offices} defaultValue={v.officeId ?? ""} placeholder="Choose" required className="sm:col-span-2" />}
        {role === "MUNICIPAL_ADMIN" && <Select name="municipalityCode" label="Municipality" options={municipalities} defaultValue={v.municipalityCode ?? ""} placeholder="Choose" required className="sm:col-span-2" />}
        {role === "BARANGAY_SECRETARY" && (
          <Checkbox name="vawc" label="VAWC records access" hint="Only for the designated VAW desk officer (RA 9262)." defaultChecked={v.vawc} className="sm:col-span-2" />
        )}
      </FormSection>
      <FormSection title="Person">
        <Input name="firstName" label="First name" defaultValue={v.firstName} required />
        <Input name="middleName" label="Middle name" defaultValue={v.middleName} />
        <Input name="lastName" label="Last name" defaultValue={v.lastName} required />
        <Input name="position" label="Position" defaultValue={v.position} placeholder="Barangay Secretary" />
        <Input name="email" label="Email" type="email" defaultValue={v.email} />
        <Input name="phone" label="Mobile number" defaultValue={v.phone} />
      </FormSection>
      {mode === "create" && (
        <FormSection title="Sign-in" description="A temporary password is generated. The person must change it on first sign-in.">
          <Input name="username" label="Username" placeholder="bagongpook.sec" required autoComplete="off" hint="Lowercase letters, numbers, dots, dashes." />
        </FormSection>
      )}
      <FormActions>
        <Link href={cancelHref} className="btn btn-secondary">
          {mode === "create" ? "Back to accounts" : "Cancel"}
        </Link>
        <SubmitButton>{mode === "create" ? "Create account" : "Save changes"}</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
