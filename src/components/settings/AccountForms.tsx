"use client";
import { ActionForm, Checkbox, FormActions, FormSection, Input, SubmitButton } from "@/components/dashboard/ui/form";
import type { ActionState } from "@/lib/action-state";

type Action = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function ProfileForm({ action, v }: { action: Action; v: { firstName: string; middleName: string; lastName: string; suffix: string; email: string; phone: string; username: string; position: string } }) {
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="Your name" description="Shown on records you create and in the activity log.">
        <Input name="firstName" label="First name" defaultValue={v.firstName} required />
        <Input name="middleName" label="Middle name" defaultValue={v.middleName} />
        <Input name="lastName" label="Last name" defaultValue={v.lastName} required />
        <Input name="suffix" label="Suffix" defaultValue={v.suffix} />
      </FormSection>
      <FormSection title="Contact" description="Your email can also be used to sign in.">
        <Input name="email" label="Email" type="email" defaultValue={v.email} />
        <Input name="phone" label="Mobile number" defaultValue={v.phone} />
      </FormSection>
      <FormSection title="Account" description="Set by your municipal IT administrator.">
        <Input name="username" label="Username" defaultValue={v.username} readOnly />
        <Input name="position" label="Position" defaultValue={v.position} readOnly />
      </FormSection>
      <FormActions>
        <SubmitButton>Save details</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function PasswordForm({ action, minLength = 8 }: { action: Action; minLength?: number }) {
  return (
    <ActionForm action={action} resetOnSuccess className="surface p-5 sm:p-7">
      <div className="grid max-w-[520px] gap-4">
        <Input name="current" label="Current password" type="password" autoComplete="current-password" required />
        <Input name="next" label="New password" type="password" autoComplete="new-password" required hint={`At least ${minLength} characters, with letters and numbers.`} />
        <Input name="confirm" label="Type the new password again" type="password" autoComplete="new-password" required />
        <Checkbox name="signOutOthers" label="Sign out my other devices" hint="Recommended if you think someone else knows your password." defaultChecked />
      </div>
      <FormActions>
        <SubmitButton>Change password</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}

export function PreferencesForm({ action, v, role = "BARANGAY_SECRETARY" }: { action: Action; v: Record<string, boolean>; role?: string }) {
  const secretary = role === "BARANGAY_SECRETARY";
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="Notify me about" description="Shown in the bell at the top of every page.">
        {secretary && <Checkbox name="requests" label="New certificate requests" hint="Online requests from residents." defaultChecked={v.requests ?? true} />}
        <Checkbox name="submissions" label={secretary ? "Submission reviews" : "New submissions"} hint={secretary ? "When the municipality approves or returns a report." : "When a barangay sends a report to your office."} defaultChecked={v.submissions ?? true} />
        <Checkbox name="announcements" label="Municipal announcements" defaultChecked={v.announcements ?? true} />
        <Checkbox name="advisories" label="Urgent advisories" hint="Health, disaster, and safety advisories." defaultChecked={v.advisories ?? true} />
      </FormSection>
      <FormSection title="Email" description="Email delivery starts once your municipality sets up an email service.">
        <Checkbox name="email" label="Also send me an email" defaultChecked={v.email ?? false} className="sm:col-span-2" />
      </FormSection>
      <FormActions>
        <SubmitButton>Save preferences</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
