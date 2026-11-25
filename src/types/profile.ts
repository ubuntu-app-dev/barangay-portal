import type { ChartDatum } from "@/types/dashboard";

export type Official = {
  id: string;
  name: string;
  position:
    | "Punong Barangay"
    | "Barangay Kagawad"
    | "SK Chairperson"
    | "Barangay Secretary"
    | "Barangay Treasurer";
  committee?: string;
  term: string;
  contact: string;
};

export type BarangayBody = {
  id: string;
  name: string;
  fullName: string;
  head: string;
  members: number;
  status: "Active" | "Reorganizing";
};

export type BarangayProfile = {
  /** "sample" means placeholder data for UI prototyping, never real barangay records. */
  source: "sample" | "live";
  general: {
    name: string;
    code: string;
    municipality: string;
    province: string;
    region: string;
    classification: "Urban" | "Rural";
    landAreaHectares: number;
    dateEstablished: string;
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
