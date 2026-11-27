import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Card from "@/components/dashboard/ui/Card";
import DetailList from "@/components/dashboard/ui/DetailList";
import ActionDialog from "@/components/dashboard/ui/Dialog";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { PageSkeleton } from "@/components/dashboard/ui/Skeleton";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import CertificatePaper from "@/components/documents/CertificatePaper";
import PrintButton from "@/components/documents/PrintButton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { certificateParagraphs } from "@/lib/dashboard/certificate-text";
import { formatDate, formatDateTime, formatPeso, longDateParts } from "@/lib/dashboard/format";
import { voidDocument } from "@/server/actions/documents";
import { getIssuedDocument, issuedStatus } from "@/server/queries/documents";

export const metadata: Metadata = { title: "Print Document" };

type Props = { params: Promise<{ id: string }> };
type Snapshot = { name: string; age: number | null; civilStatus: string; address: string; residentSince: number | null };

async function Content({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const d = await getIssuedDocument(session, id);
  const snap = d.snapshot as Snapshot;
  const status = issuedStatus(d);
  const b = session.barangay;
  const paragraphs = certificateParagraphs(d.documentType.key, {
    name: snap.name,
    age: snap.age,
    civilStatus: (snap.civilStatus ?? "").toLowerCase().replace("_", "-"),
    address: `${snap.address}, ${b.name}, ${b.municipality}`,
    since: snap.residentSince,
    purpose: d.purpose,
    ...longDateParts(d.issuedAt.getTime()),
    place: `${b.name}, ${b.municipality}, ${b.province}`,
  });
  const fee = Number(d.fee);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader back={{ href: routes.issuanceHistory, label: "Issuance History" }} eyebrow={d.documentType.name} title={d.controlNo} description={`Issued to ${snap.name} on ${formatDateTime(d.issuedAt.toISOString())}`}>
          {status !== "Voided" && (
            <ActionDialog
              trigger="Void"
              triggerClassName="btn btn-secondary text-dash-danger"
              title={`Void ${d.controlNo}?`}
              description="A void document cannot be printed again. It stays in the register with your reason."
              action={voidDocument}
              hidden={{ id: d.id }}
              confirmLabel="Void document"
              tone="danger"
              icon="xCircle"
              reason={{ label: "Reason", required: true }}
            />
          )}
          {status !== "Voided" && <PrintButton id={d.id} label={d.printCount > 0 ? "Reprint" : "Print"} />}
        </PageHeader>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <CertificatePaper
            name={d.documentType.name}
            validityMonths={d.validUntil ? 1 : null}
            barangay={b}
            signatory={{ name: d.signatoryName, position: d.signatoryPosition }}
            paragraphs={paragraphs}
            validUntil={d.validUntil ? formatDate(d.validUntil.toISOString()) : ""}
            controlNo={d.controlNo}
            orNumber={d.orNumber}
            fee={fee > 0 ? formatPeso(fee) : undefined}
            voided={status === "Voided"}
          />
        </div>
        <div className="no-print space-y-6">
          <Card title="Record" icon="info" actions={<StatusBadge status={status} />}>
            <DetailList
              columns={1}
              rows={[
                ["Resident", <Link key="r" href={`${routes.residents}/${d.residentId}`} className="text-dash-primary hover:underline">{snap.name}</Link>],
                ["Purpose", d.purpose],
                ["Fee", formatPeso(fee)],
                ["O.R. number", d.orNumber],
                ["Valid until", d.validUntil ? formatDate(d.validUntil.toISOString()) : "No expiry"],
                ["Request", d.request?.requestNo],
                ["Times printed", String(d.printCount)],
                ...(status === "Voided" ? ([["Void reason", d.voidReason]] as [string, string | null][]) : []),
              ]}
            />
          </Card>
          <p className="text-[12.5px] text-ink-secondary">The certificate shows the resident&rsquo;s details as they were when it was issued, so reprints always match the original.</p>
        </div>
      </div>
    </div>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
