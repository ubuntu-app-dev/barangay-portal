"use client";
import { ActionForm, FormActions, FormSection, Input, SubmitButton, Textarea } from "@/components/dashboard/ui/form";
import type { ActionState } from "@/lib/action-state";

export default function SettingsForm({ action, v }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; v: { sessionHours: number; passwordMinLength: number; maintenanceBanner: string } }) {
  return (
    <ActionForm action={action} className="surface p-5 sm:p-7">
      <FormSection title="Sign-in" description="Applies to new sign-ins. People already signed in keep their current session until it ends.">
        <Input name="sessionHours" label="Session length (hours)" type="number" min={1} max={72} defaultValue={v.sessionHours} required hint="1 to 72. Shorter is safer on shared computers." />
        <Input name="passwordMinLength" label="Minimum password length" type="number" min={8} max={32} defaultValue={v.passwordMinLength} required hint="8 to 32 characters, letters and numbers." />
      </FormSection>
      <FormSection title="Notice for everyone" description="Shown at the top of every signed-in page, for example before maintenance.">
        <Textarea name="maintenanceBanner" label="Banner text" defaultValue={v.maintenanceBanner} rows={3} placeholder="LGU Connect will be offline on Saturday, 8 to 10 PM, for maintenance." hint="Leave empty to hide the banner." className="sm:col-span-2" />
      </FormSection>
      <FormActions>
        <SubmitButton>Save settings</SubmitButton>
      </FormActions>
    </ActionForm>
  );
}
