import Link from "next/link";
import Card from "@/components/dashboard/ui/Card";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import { Input, Select, Textarea } from "@/components/dashboard/ui/form";
import Icon from "@/components/dashboard/ui/Icon";
import ListToolbar from "@/components/dashboard/ui/ListToolbar";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import Pagination from "@/components/dashboard/ui/Pagination";
import RecordPicker from "@/components/dashboard/ui/RecordPicker";
import StatTiles from "@/components/dashboard/ui/StatTiles";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import Table, { Cell2 } from "@/components/dashboard/ui/Table";
import Tabs from "@/components/dashboard/ui/Tabs";
import { routes } from "@/config/navigation";
import { formatDateTime, formatNumber, nameLastFirst } from "@/lib/dashboard/format";
import { CHANNEL, REQUEST_STATUS, label, options } from "@/lib/labels";
import { createRequest, moveRequest } from "@/server/actions/documents";
import { flat, str, type SearchParams } from "@/server/params";
import { getDocumentTypes, listRequests, requestStats } from "@/server/queries/documents";
import type { Session } from "@/types/dashboard";

export default async function RequestsView({ session, sp }: { session: Session; sp: SearchParams }) {
  const [s, types, list] = await Promise.all([requestStats(session), getDocumentTypes(session), listRequests(session, sp)]);
  const base = routes.certificateRequests;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Document Management" icon="inbox" title="Certificate Requests" description="Requests from residents, from first request to release.">
        <ActionDialog
          trigger={
            <>
              <Icon name="plus" className="h-4 w-4" /> New request
            </>
          }
          triggerClassName="btn btn-secondary"
          title="Record a request"
          description="For walk-in or phoned-in requests that will be processed later. To issue right away, use Issue certificate."
          action={createRequest}
          confirmLabel="Record request"
          icon="inbox"
        >
          <RecordPicker name="residentId" label="Resident" type="resident" required />
          <Select name="documentTypeId" label="Document" options={types.map((t) => ({ value: t.id, label: t.name }))} placeholder="Choose" required />
          <Input name="purpose" label="Purpose" placeholder="For example, employment" required />
          <Select name="channel" label="Received via" options={options(CHANNEL)} defaultValue="WALK_IN" required />
          <Textarea name="remarks" label="Remarks" rows={2} />
        </ActionDialog>
        <Link href={routes.issueCertificate} className="btn btn-primary">
          <Icon name="fileCheck" className="h-4 w-4" /> Issue certificate
        </Link>
      </PageHeader>
      <StatTiles
        tiles={[
          { icon: "clock", label: "Pending", value: formatNumber(s.pending), tone: "gold", href: `${base}?status=PENDING` },
          { icon: "refresh", label: "Processing", value: formatNumber(s.processing), tone: "secondary", href: `${base}?status=PROCESSING` },
          { icon: "inbox", label: "Ready for release", value: formatNumber(s.ready), tone: "success", href: `${base}?status=READY_FOR_RELEASE` },
          { icon: "fileCheck", label: "Released this month", value: formatNumber(s.releasedThisMonth), tone: "primary" },
        ]}
      />
      <Card title="Request Queue" icon="inbox">
        <div className="mb-4">
          <Tabs
            label="Request views"
            tabs={[
              { label: "Open requests", href: base },
              { label: "All requests", href: `${base}?view=all` },
            ]}
          />
        </div>
        <ListToolbar
          placeholder="Search request no., resident, or purpose"
          filters={[
            { name: "status", label: "Status", options: options(REQUEST_STATUS) },
            { name: "type", label: "Document", options: types.map((t) => ({ value: t.id, label: t.name })) },
          ]}
        />
        <Table
          caption="Certificate requests"
          rows={list.rows}
          rowKey={(r) => r.id}
          empty={{ icon: "inbox", title: "No requests here", text: "New requests will appear here. Switch to All requests to see closed ones." }}
          cols={[
            { key: "no", header: "Request", cell: (r) => <Cell2 title={<span className="tabular-nums">{r.requestNo}</span>} sub={`${label(CHANNEL, r.channel)} · ${formatDateTime(r.requestedAt.toISOString())}`} /> },
            { key: "resident", header: "Resident", cell: (r) => <Cell2 title={nameLastFirst(r.resident)} sub={r.resident.residentNo} href={`${routes.residents}/${r.resident.id}`} /> },
            { key: "doc", header: "Document", cell: (r) => <Cell2 title={r.documentType.name} sub={r.purpose} /> },
            {
              key: "status",
              header: "Status",
              cell: (r) => (
                <div>
                  <StatusBadge status={label(REQUEST_STATUS, r.status)} />
                  {r.rejectionReason && <p className="mt-1 max-w-[220px] text-[12px] text-ink-secondary">{r.rejectionReason}</p>}
                  {r.issued && (
                    <Link href={`${routes.printDocument}/${r.issued.id}`} className="mt-1 block text-[12px] font-medium text-dash-primary hover:underline">
                      {r.issued.controlNo}
                    </Link>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              cell: (r) => (
                <div className="flex flex-wrap justify-end gap-1">
                  {(r.status === "PENDING" || r.status === "PROCESSING") && (
                    <Link href={`${routes.issueCertificate}?request=${r.id}`} className="btn btn-primary btn-sm">
                      Issue
                    </Link>
                  )}
                  {r.status === "PENDING" && (
                    <ActionDialog trigger="Start" triggerClassName="btn btn-ghost btn-sm" title={`Start processing ${r.requestNo}?`} description="Marks the request as being checked (requirements, payment)." action={moveRequest} hidden={{ id: r.id, move: "process" }} confirmLabel="Start processing" icon="refresh" />
                  )}
                  {r.status === "READY_FOR_RELEASE" && (
                    <ActionDialog trigger="Release" triggerClassName="btn btn-primary btn-sm" title={`Release ${r.requestNo}?`} description={`Confirm that ${r.resident.firstName} ${r.resident.lastName} received the document.`} action={moveRequest} hidden={{ id: r.id, move: "release" }} confirmLabel="Mark as released" icon="checkCircle" />
                  )}
                  {(r.status === "PENDING" || r.status === "PROCESSING") && (
                    <ActionDialog
                      trigger="Reject"
                      triggerClassName="btn btn-ghost btn-sm text-dash-danger"
                      title={`Reject ${r.requestNo}?`}
                      action={moveRequest}
                      hidden={{ id: r.id, move: "reject" }}
                      confirmLabel="Reject request"
                      tone="danger"
                      icon="xCircle"
                      reason={{ label: "Reason (shown to the resident)", placeholder: "For example, incomplete requirements: no proof of residency", required: true }}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.total} params={flat(sp)} basePath={base} />
        {str(sp.view) !== "all" && <p className="mt-3 text-[12.5px] text-ink-secondary">Showing open requests only. Released, rejected, and cancelled requests are under All requests.</p>}
      </Card>
    </div>
  );
}
