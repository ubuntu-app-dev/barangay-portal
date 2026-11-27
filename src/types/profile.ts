import type { ChartDatum } from "@/types/dashboard";

export type Official = {
  id: string;
  name: string;
  /** Punong Barangay, Barangay Kagawad, SK Chairperson, Barangay Secretary, Barangay Treasurer, or another title. */
  position: string;
  committee: string;
  termStart: string;
  termEnd: string;
  /** "2023 to 2026", or "Term not set". */
  term: string;
  contact: string;
  email: string;
  isSignatory: boolean;
  isActive: boolean;
};

export type BarangayBody = {
  id: string;
  /** Short name, e.g. "BADAC". */
  name: string;
  fullName: string;
  head: string;
  members: number;
  status: "Active" | "Inactive";
  description: string;
};

export type PurokRow = { id: string; name: string; households: number; residents: number };

export type BarangayProfile = {
  general: {
    name: string;
    code: string;
    municipality: string;
    province: string;
    region: string;
    classification: "Urban" | "Rural";
    classificationKey: "URBAN" | "RURAL";
    landAreaHectares: number | null;
    dateEstablished: string | null;
    zipCode: string;
    legislativeDistrict: string;
  };
  glance: {
    population: number;
    households: number;
    registeredVoters: number;
    seniorCitizens: number;
  };
  boundaries: { north: string; east: string; south: string; west: string };
  puroks: ChartDatum[];
  purokRows: PurokRow[];
  about: { history: string; vision: string; mission: string };
  officials: Official[];
  bodies: BarangayBody[];
  contact: {
    address: string;
    landline: string;
    mobile: string;
    email: string;
    facebook: string;
    hours: { days: string; time: string }[];
    hotlines: { name: string; number: string; note?: string }[];
  };
};
