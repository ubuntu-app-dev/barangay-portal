import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Checkbox, Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import { isoDay } from "@/lib/dashboard/format";
import { FREQUENCY, REPORT_KIND, options } from "@/lib/labels";
import { saveRequirement } from "@/server/actions/municipal";

type Req = { id: string; title: string; kind: string; officeId: string; frequency: string; periodStart: Date; periodEnd: Date; dueAt: Date; description: string | null; isActive: boolean };

const localDT = (d: Date) => new Date(d.getTime() + 8 * 3600_000).toISOString().slice(0, 16);

export default function RequirementDialog({ req, offices, defaultOffice }: { req?: Req; offices: { id: string; name: string }[]; defaultOffice?: string }) {
  return (
    <ActionDialog
      trigger={req ? <><Icon name="edit" className="h-3.5 w-3.5" /> Edit</> : <><Icon name="plus" className="h-4 w-4" /> New requirement</>}
      triggerClassName={req ? "btn btn-ghost btn-sm" : "btn btn-primary"}
      title={req ? "Edit requirement" : "Require a report from every barangay"}
      description={req ? undefined : "Every active barangay secretary is notified and sees it under Pending Submissions."}
      action={saveRequirement}
      hidden={req ? { id: req.id } : undefined}
      confirmLabel={req ? "Save" : "Publish requirement"}
      icon="clipboard"
    >
      <Input name="title" label="Title" defaultValue={req?.title} placeholder="Monthly Blotter Report (November 2026)" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="kind" label="Report" options={options(REPORT_KIND)} defaultValue={req?.kind ?? ""} placeholder="Choose" required />
        <Select name="frequency" label="Frequency" options={options(FREQUENCY)} defaultValue={req?.frequency ?? "MONTHLY"} required />
        <Input name="periodStart" label="Covers from" type="date" defaultValue={isoDay(req?.periodStart)} required />
        <Input name="periodEnd" label="Covers to" type="date" defaultValue={isoDay(req?.periodEnd)} required />
        <Input name="dueAt" label="Due" type="datetime-local" defaultValue={req ? localDT(req.dueAt) : ""} required />
        <Select name="officeId" label="Reviewing office" options={offices.map((o) => ({ value: o.id, label: o.name }))} defaultValue={req?.officeId ?? defaultOffice ?? ""} placeholder="Choose" required />
      </div>
      <Textarea name="description" label="Instructions for barangays" defaultValue={req?.description ?? ""} rows={3} />
      {req && <Checkbox name="isActive" label="Active" hint="Untick to stop asking barangays for it." defaultChecked={req.isActive} />}
    </ActionDialog>
  );
}
