import PageHeader from "@/components/dashboard/ui/PageHeader";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { routes } from "@/config/navigation";
import { nameLastFirst } from "@/lib/dashboard/format";
import { db } from "@/server/db";
import { str, type SearchParams } from "@/server/params";
import { getDocumentTypes, getRequest, getSignatory } from "@/server/queries/documents";
import { ageOn } from "@/server/time";
import type { Session } from "@/types/dashboard";
import IssuanceWorkspace from "./IssuanceWorkspace";

/** Checks the ?type=, ?request=, and ?resident= links, then hands a clean starting point to the workspace. */
export default async function IssuanceView({ session, sp }: { session: Session; sp: SearchParams }) {
  const [types, signatory, request] = await Promise.all([getDocumentTypes(session), getSignatory(session), getRequest(session, str(sp.request))]);
  if (types.length === 0) return <EmptyState icon="file" title="No document types available" text="Turn on at least one document in its settings." />;
  const residentId = request?.residentId ?? str(sp.resident);
  const resident = residentId ? await db.resident.findFirst({ where: { id: residentId, barangayCode: session.barangay.code, deletedAt: null, status: "ACTIVE" }, include: { purok: true } }) : null;
  const typeId = request?.documentTypeId ?? types.find((t) => t.id === str(sp.type) || t.key === str(sp.type))?.id ?? types[0].id;
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Document Management" icon="filePlus" title="Certificate Issuance" description="Fill in the details and check the preview before you issue." back={request ? { href: routes.certificateRequests, label: "Certificate Requests" } : undefined} />
      <IssuanceWorkspace
        types={types}
        barangay={session.barangay}
        signatory={signatory}
        initialTypeId={typeId}
        printBase={routes.printDocument}
        initialResident={resident ? { value: resident.id, label: nameLastFirst(resident), sub: `${resident.residentNo} · ${ageOn(resident.birthDate, now)} yrs · ${resident.purok?.name ?? resident.address}` } : null}
        prefill={request ? { requestId: request.id, requestNo: request.requestNo, purpose: request.purpose } : undefined}
      />
    </div>
  );
}
