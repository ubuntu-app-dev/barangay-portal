import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Checkbox, Input, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import { updateDocumentType } from "@/server/actions/documents";
import type { DocumentTypeInfo } from "@/types/documents";

/** Fee, validity, requirements, and availability of one document type for this barangay. */
export default function DocTypeSettings({ type, compact }: { type: DocumentTypeInfo; compact?: boolean }) {
  return (
    <ActionDialog
      trigger={
        <>
          <Icon name="settings" className="h-4 w-4" /> {compact ? "Settings" : "Fee and requirements"}
        </>
      }
      triggerClassName={compact ? "btn btn-ghost btn-sm" : "btn btn-secondary"}
      title={`${type.name} settings`}
      description="Follow your barangay's approved schedule of fees. Documents already issued keep their original fee and validity."
      action={updateDocumentType}
      hidden={{ id: type.id }}
      confirmLabel="Save settings"
      icon="settings"
    >
      <Input name="name" label="Name" defaultValue={type.name} required />
      <Textarea name="description" label="Description" defaultValue={type.description} rows={2} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="fee" label="Fee (₱)" type="number" min={0} step="1" defaultValue={type.fee} required hint="0 for free documents." />
        <Input name="validityMonths" label="Valid for (months)" type="number" min={1} max={120} defaultValue={type.validityMonths ?? ""} hint="Empty for no expiry." />
      </div>
      <Textarea name="requirements" label="Requirements" defaultValue={type.requirements.join("\n")} rows={4} hint="One per line." />
      <Checkbox name="isActive" label="Available for issuing" defaultChecked={type.isActive} />
    </ActionDialog>
  );
}
