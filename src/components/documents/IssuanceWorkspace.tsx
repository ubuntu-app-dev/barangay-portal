"use client";
import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import Card from "@/components/dashboard/ui/Card";
import Icon from "@/components/dashboard/ui/Icon";
import RecordPicker, { type PickerOption } from "@/components/dashboard/ui/RecordPicker";
import { useNow } from "@/hooks/use-now";
import { certificateParagraphs } from "@/lib/dashboard/certificate-text";
import { formatDate, formatPeso, longDateParts } from "@/lib/dashboard/format";
import { issueDocument } from "@/server/actions/documents";
import type { DocumentTypeInfo, ResidentDetail } from "@/types/documents";
import CertificatePaper from "./CertificatePaper";

type Props = {
  types: DocumentTypeInfo[];
  barangay: { name: string; municipality: string; province: string };
  signatory: { name: string; position: string };
  initialTypeId: string;
  initialResident?: PickerOption | null;
  prefill?: { requestId: string; requestNo: string; purpose: string };
  printBase: string;
};

const PURPOSES = ["Employment", "Scholarship", "Medical assistance", "Travel", "Bank requirement", "School enrollment", "Loan application"];
type Outcome = { kind: "idle" } | { kind: "error"; message: string; field?: string } | { kind: "done"; id: string; controlNo: string };

/** Left: the form. Right: a live preview of the certificate. Nothing is recorded until the server issues it. */
export default function IssuanceWorkspace({ types, barangay, signatory, initialTypeId, initialResident = null, prefill, printBase }: Props) {
  const now = useNow();
  const [typeId, setTypeId] = useState(initialTypeId);
  const [residentOpt, setResidentOpt] = useState<PickerOption | null>(initialResident);
  const [detail, setDetail] = useState<ResidentDetail | null>(null);
  // Only trust details that belong to the resident currently picked.
  const resident = residentOpt && detail?.id === residentOpt.value ? detail : null;
  const [purpose, setPurpose] = useState(prefill?.purpose ?? "");
  const [orNumber, setOrNumber] = useState("");
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const [pending, start] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const type = types.find((t) => t.id === typeId) ?? types[0];
  const needsOr = type.fee > 0;
  const locked = !!prefill;

  // Load the chosen resident's details for the preview.
  useEffect(() => {
    if (!residentOpt) return;
    const ctrl = new AbortController();
    fetch(`/api/dashboard/lookup?type=resident&id=${encodeURIComponent(residentOpt.value)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ResidentDetail | null) => setDetail(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, [residentOpt]);

  const parts = now ? longDateParts(now) : { day: "[day]", month: "[month]", year: "[year]" };
  let validUntil = "[date]";
  if (now && type.validityMonths) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + type.validityMonths);
    validUntil = formatDate(d.toISOString());
  }
  const paragraphs = certificateParagraphs(type.key, {
    name: resident?.name ?? "[select a resident]",
    age: resident?.age ?? null,
    civilStatus: resident?.civilStatus ?? "",
    address: resident ? `${resident.address}${resident.purok ? `, ${resident.purok}` : ""}, ${barangay.name}, ${barangay.municipality}` : "[address]",
    since: resident?.residentSince ?? null,
    purpose: purpose.trim(),
    ...parts,
    place: `${barangay.name}, ${barangay.municipality}, ${barangay.province}`,
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!residentOpt) return setOutcome({ kind: "error", message: "Select the resident first.", field: "residentId" });
    if (!purpose.trim()) return setOutcome({ kind: "error", message: "Enter the purpose of the document.", field: "purpose" });
    if (needsOr && !orNumber.trim()) return setOutcome({ kind: "error", message: "Enter the official receipt number for the fee.", field: "orNumber" });
    start(async () => {
      const result = await issueDocument({ typeId, residentId: residentOpt.value, purpose: purpose.trim(), orNumber: needsOr ? orNumber.trim() : undefined, requestId: prefill?.requestId });
      setOutcome(result.ok ? { kind: "done", id: result.id, controlNo: result.controlNo } : { kind: "error", message: result.message, field: result.field });
    });
  };

  const reset = () => {
    setResidentOpt(null);
    setPurpose("");
    setOrNumber("");
    setOutcome({ kind: "idle" });
    setFormKey((k) => k + 1);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,460px)_1fr]">
      <Card title="Document Details" icon="filePlus">
        {outcome.kind === "done" ? (
          <div role="status" className="space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dash-success-soft text-dash-success">
              <Icon name="checkCircle" className="h-7 w-7" />
            </span>
            <div>
              <p className="font-display text-[18px] font-bold">Document issued</p>
              <p className="mt-1 text-[14px] text-ink-secondary">
                Control no. <strong className="text-ink">{outcome.controlNo}</strong>
                {prefill ? ". The request is now ready for release." : "."}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href={`${printBase}/${outcome.id}`} className="btn btn-primary">
                <Icon name="printer" className="h-4 w-4" /> Print
              </Link>
              {prefill ? (
                <Link href="/dashboard/document-management/certificate-requests" className="btn btn-secondary">
                  Back to requests
                </Link>
              ) : (
                <button type="button" onClick={reset} className="btn btn-secondary">
                  Issue another
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {prefill && (
              <p className="mb-4 flex items-start gap-2 rounded-xl bg-dash-primary-soft px-4 py-3 text-[14px] text-dash-primary">
                <Icon name="inbox" className="mt-0.5 h-4 w-4" />
                Processing request {prefill.requestNo}. Check the details, then issue.
              </p>
            )}
            <form key={formKey} onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={pending}>
              <div>
                <label htmlFor="doc-type" className="mb-1.5 block text-[13px] font-semibold">
                  Document
                </label>
                <select
                  id="doc-type"
                  value={typeId}
                  disabled={locked}
                  onChange={(e) => {
                    setTypeId(e.target.value);
                    setOutcome({ kind: "idle" });
                  }}
                  className="field"
                >
                  <optgroup label="Certificates">
                    {types
                      .filter((t) => t.category === "certificate")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Other documents">
                    {types
                      .filter((t) => t.category === "other")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <p className="mt-1.5 text-[12.5px] text-ink-secondary">{type.description}</p>
              </div>

              {locked ? (
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold">Resident</p>
                  <p className="field">{residentOpt?.label}</p>
                </div>
              ) : (
                <RecordPicker
                  name="residentId"
                  label="Resident"
                  type="resident"
                  initial={residentOpt}
                  required
                  onChange={(o) => {
                    setResidentOpt(o);
                    setOutcome({ kind: "idle" });
                  }}
                />
              )}

              <div>
                <label htmlFor="purpose" className="mb-1.5 block text-[13px] font-semibold">
                  Purpose
                </label>
                <input
                  id="purpose"
                  value={purpose}
                  aria-invalid={outcome.kind === "error" && outcome.field === "purpose" ? true : undefined}
                  onChange={(e) => {
                    setPurpose(e.target.value);
                    setOutcome({ kind: "idle" });
                  }}
                  placeholder="For example, employment"
                  className="field"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PURPOSES.map((p) => (
                    <button key={p} type="button" onClick={() => setPurpose(p)} className={`rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors ${purpose === p ? "border-dash-primary bg-dash-primary-soft text-dash-primary" : "border-rule hover:bg-ground-muted"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold">Fee</p>
                  <p className="field flex items-center font-semibold">{formatPeso(type.fee)}</p>
                </div>
                {needsOr && (
                  <div>
                    <label htmlFor="or-number" className="mb-1.5 block text-[13px] font-semibold">
                      Official receipt no.
                    </label>
                    <input id="or-number" value={orNumber} aria-invalid={outcome.kind === "error" && outcome.field === "orNumber" ? true : undefined} onChange={(e) => setOrNumber(e.target.value)} className="field" />
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-ground-muted/70 p-4">
                <p className="text-[13px] font-semibold">Check the requirements</p>
                <ul className="mt-2 space-y-1.5">
                  {type.requirements.map((r) => (
                    <li key={r} className="flex gap-2 text-[13px] text-ink-secondary">
                      <Icon name="check" className="mt-0.5 h-3.5 w-3.5 text-dash-success" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {outcome.kind === "error" && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-dash-danger-soft px-4 py-3 text-[14px] font-medium text-dash-danger">
                  <Icon name="alert" className="mt-0.5 h-4 w-4" />
                  {outcome.message}
                </p>
              )}
              <button type="submit" disabled={pending} className="btn btn-primary w-full">
                {pending ? "Issuing…" : "Issue document"}
              </button>
              <p className="text-[12px] text-ink-secondary">Printing opens after a document is issued, so every printed copy carries a control number.</p>
            </form>
          </>
        )}
      </Card>

      <div className="min-w-0 space-y-3 xl:sticky xl:top-24 xl:self-start">
        <p className="flex items-center gap-2 text-[13px] text-ink-secondary">
          <Icon name="eye" className="h-4 w-4" />
          Live preview. The wording is a sample: use your barangay&rsquo;s approved format.
        </p>
        <CertificatePaper name={type.name} validityMonths={type.validityMonths} barangay={barangay} signatory={signatory} paragraphs={paragraphs} validUntil={validUntil} controlNo={outcome.kind === "done" ? outcome.controlNo : undefined} />
      </div>
    </div>
  );
}
