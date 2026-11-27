import type { DocumentKey } from "@/types/documents";

export type TextContext = {
  name: string;
  age: number | null;
  civilStatus: string;
  address: string;
  since: number | null;
  purpose: string;
  day: string;
  month: string;
  year: string;
  place: string;
};

/**
 * SAMPLE wording for the preview. Every barangay has its own approved format: replace these with yours.
 */
export function certificateParagraphs(
  type: DocumentKey,
  c: TextContext,
): string[] {
  const who = `${c.name}${c.age ? `, ${c.age} years old` : ""}${c.civilStatus ? `, ${c.civilStatus}` : ""}, Filipino`;
  const closing = `Issued this ${c.day} day of ${c.month}, ${c.year} at ${c.place}, Philippines.`;
  const request = `This certification is issued upon the request of the above-named person for ${c.purpose || "[purpose]"}.`;
  switch (type) {
    case "clearance":
      return [
        `This is to certify that ${who}, is a bona fide resident of ${c.address}.`,
        "Based on the records of this barangay, the above-named person has no derogatory record or pending case as of this date.",
        request,
        closing,
      ];
    case "indigency":
      return [
        `This is to certify that ${who}, is a resident of ${c.address}.`,
        "The above-named person belongs to an indigent family in this barangay, as known to the undersigned.",
        request,
        closing,
      ];
    case "residency":
      return [
        `This is to certify that ${who}, is a resident of ${c.address}${c.since ? `, and has been residing in this barangay since ${c.since}` : ""}.`,
        request,
        closing,
      ];
    case "good-moral":
      return [
        `This is to certify that ${who}, residing at ${c.address}, is known to the undersigned as a person of good moral character and a law-abiding member of this community.`,
        request,
        closing,
      ];
    case "business-clearance":
      return [
        `This is to certify that ${who}, residing at ${c.address}, has been granted clearance to operate a business within the jurisdiction of this barangay, subject to existing laws and ordinances.`,
        request,
        closing,
      ];
    case "jobseeker":
      return [
        `This is to certify that ${who}, a resident of ${c.address}${c.since ? ` since ${c.since}` : ""}, is a first-time jobseeker as defined under Republic Act No. 11261 (First Time Jobseekers Assistance Act).`,
        "This certification is valid for one year from the date of issue and may be used only once.",
        closing,
      ];
    default:
      return [
        `This is to certify that ${who}, residing at ${c.address}, is a registered resident of this barangay.`,
        request,
        closing,
      ];
  }
}
