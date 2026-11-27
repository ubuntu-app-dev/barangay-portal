/** Stable keys of the built-in document types (barangays can rename them, not re-key them). */
export type DocumentKey = "clearance" | "indigency" | "residency" | "good-moral" | "business-clearance" | "barangay-id" | "jobseeker" | "permit" | (string & {});

export type DocumentTypeInfo = {
  id: string;
  key: DocumentKey;
  name: string;
  shortName: string;
  description: string;
  /** Page under /dashboard/document-management/, for the four main certificates. */
  slug?: string;
  category: "certificate" | "other";
  requirements: string[];
  fee: number;
  validityMonths: number | null;
  prefix: string;
  isActive: boolean;
};

export type ResidentDetail = {
  id: string;
  name: string;
  age: number;
  sex: string;
  civilStatus: string;
  address: string;
  purok: string;
  residentSince: number | null;
};

export type IssuedStatus = "Valid" | "Expired" | "Voided";
