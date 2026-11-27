type Props = {
  name: string;
  validityMonths: number | null;
  barangay: { name: string; municipality: string; province: string };
  signatory: { name: string; position: string };
  paragraphs: string[];
  validUntil: string;
  controlNo?: string;
  orNumber?: string | null;
  fee?: string;
  voided?: boolean;
};

/** The certificate on paper. Used for the live preview and for printing an issued document. */
export default function CertificatePaper({ name, validityMonths, barangay, signatory, paragraphs, validUntil, controlNo, orNumber, fee, voided }: Props) {
  return (
    <article aria-label={`${name}${controlNo ? ` ${controlNo}` : " preview"}`} className="print-area relative overflow-hidden rounded-2xl border border-rule bg-white p-6 font-serif text-[#16191f] shadow-md sm:p-12">
      {voided && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="-rotate-[24deg] rounded-xl border-8 border-[#b42318]/60 px-8 py-2 font-sans text-[72px] font-black tracking-widest text-[#b42318]/60">VOID</span>
        </div>
      )}
      <header className="flex items-center justify-center gap-5 text-center leading-snug">
        <span aria-hidden="true" className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#0038a8] font-sans text-[10px] font-bold text-[#0038a8] sm:flex">
          SEAL
        </span>
        <div>
          <p className="text-[13px]">Republic of the Philippines</p>
          <p className="text-[13px]">Province of {barangay.province}</p>
          <p className="text-[13px]">Municipality of {barangay.municipality}</p>
          <p className="mt-1 text-[17px] font-bold uppercase tracking-wide">{barangay.name}</p>
          <p className="text-[12px] font-semibold tracking-widest">OFFICE OF THE PUNONG BARANGAY</p>
        </div>
        <span aria-hidden="true" className="hidden h-16 w-16 sm:block" />
      </header>
      <div aria-hidden="true" className="my-5 flex h-1">
        <span className="flex-[2] bg-[#0038a8]" />
        <span className="flex-1 bg-[#ce1126]" />
        <span className="flex-1 bg-[#fcd116]" />
      </div>
      <h2 className="my-7 text-center text-[21px] font-bold uppercase tracking-[0.12em] underline underline-offset-4">{name}</h2>
      <p className="mb-4 font-bold">TO WHOM IT MAY CONCERN:</p>
      <div className="space-y-4 text-[15px] leading-relaxed">
        {paragraphs.map((p) => (
          <p key={p} className="indent-10 text-justify">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
        <div className="text-[12px] leading-relaxed text-[#454c58]">
          <p>Control No.: {controlNo ?? "(assigned when issued)"}</p>
          {orNumber && <p>O.R. No.: {orNumber}</p>}
          {fee && <p>Amount paid: {fee}</p>}
          <p>{validityMonths ? `Valid until: ${validUntil}` : "No expiry date"}</p>
          <p className="mt-2 italic">Not valid without the official dry seal.</p>
        </div>
        <div className="min-w-[230px] text-center">
          <p className="border-b border-[#16191f] pb-1 text-[15px] font-bold uppercase">{signatory.name}</p>
          <p className="pt-1 text-[13px]">{signatory.position}</p>
        </div>
      </div>
    </article>
  );
}
