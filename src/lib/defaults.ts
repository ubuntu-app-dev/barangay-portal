/**
 * Defaults copied into a barangay when it is onboarded (seed, or the municipal admin later).
 * Fees, validity, and requirements are starting values: each barangay sets its own approved schedule.
 */
export const DEFAULT_DOCUMENT_TYPES = [
  {
    key: "clearance",
    name: "Barangay Clearance",
    shortName: "clearance",
    category: "CERTIFICATE",
    prefix: "BC",
    fee: 50,
    validityMonths: 6,
    description: "Certifies that a resident has no derogatory record or pending case in the barangay.",
    requirements: ["Valid government-issued ID", "Proof of residency", "Community tax certificate (cedula)", "Recent 1x1 photo"],
  },
  {
    key: "indigency",
    name: "Certificate of Indigency",
    shortName: "indigency certificate",
    category: "CERTIFICATE",
    prefix: "CI",
    fee: 0,
    validityMonths: 6,
    description: "Certifies that a resident belongs to an indigent family, usually for medical, legal, or school assistance.",
    requirements: ["Valid ID or proof of residency", "Letter or request stating the purpose", "Barangay verification of the family's situation"],
  },
  {
    key: "residency",
    name: "Certificate of Residency",
    shortName: "residency certificate",
    category: "CERTIFICATE",
    prefix: "CR",
    fee: 30,
    validityMonths: 6,
    description: "Certifies that a person lives in the barangay and since when.",
    requirements: ["Valid government-issued ID", "Proof of length of stay, such as a utility bill", "Community tax certificate (cedula)"],
  },
  {
    key: "good-moral",
    name: "Certificate of Good Moral Character",
    shortName: "good moral certificate",
    category: "CERTIFICATE",
    prefix: "GM",
    fee: 50,
    validityMonths: 6,
    description: "Certifies that a resident is known in the community as a person of good moral character.",
    requirements: ["Valid government-issued ID", "Proof of residency", "Letter stating the purpose"],
  },
  {
    key: "business-clearance",
    name: "Business Clearance",
    shortName: "business clearance",
    category: "OTHER",
    prefix: "BZ",
    fee: 500,
    validityMonths: 12,
    description: "Barangay clearance for a business operating in the barangay.",
    requirements: ["Valid ID of the owner", "Business name and address", "Proof of business location"],
  },
  {
    key: "barangay-id",
    name: "Barangay ID",
    shortName: "barangay ID",
    category: "OTHER",
    prefix: "ID",
    fee: 100,
    validityMonths: 36,
    description: "Identification card issued to registered residents.",
    requirements: ["Valid ID or birth certificate", "Proof of residency", "Recent 1x1 photo"],
  },
  {
    key: "jobseeker",
    name: "First-Time Jobseeker Certification",
    shortName: "jobseeker certification",
    category: "OTHER",
    prefix: "FJ",
    fee: 0,
    validityMonths: 12,
    description: "Certification for first-time jobseekers. The fee is waived under the First Time Jobseekers Assistance Act (RA 11261).",
    requirements: ["Valid ID or proof of residency", "Oath of undertaking as a first-time jobseeker"],
  },
  {
    key: "permit",
    name: "Barangay Permit",
    shortName: "barangay permit",
    category: "OTHER",
    prefix: "BP",
    fee: 200,
    validityMonths: null,
    description: "Permit for events, gatherings, and other activities held in the barangay.",
    requirements: ["Letter of request", "Date, time, and place of the activity", "Contact person"],
  },
] as const;

export const DEFAULT_BODIES = [
  { acronym: "Lupon", name: "Lupong Tagapamayapa", head: "Punong Barangay", memberCount: 15 },
  { acronym: "BPOC", name: "Barangay Peace and Order Committee", head: "Punong Barangay", memberCount: 12 },
  { acronym: "BADAC", name: "Barangay Anti-Drug Abuse Council", head: "Punong Barangay", memberCount: 14 },
  { acronym: "BDRRMC", name: "Barangay Disaster Risk Reduction and Management Committee", head: "Punong Barangay", memberCount: 18 },
  { acronym: "BCPC", name: "Barangay Council for the Protection of Children", head: "Punong Barangay", memberCount: 11 },
  { acronym: "VAW Desk", name: "Violence Against Women Desk", head: "Barangay Kagawad", memberCount: 5 },
  { acronym: "BHW", name: "Barangay Health Workers", head: "Barangay Kagawad", memberCount: 24 },
  { acronym: "Tanod", name: "Barangay Tanod", head: "Punong Barangay", memberCount: 30 },
] as const;

export const DEFAULT_OFFICE_HOURS = [
  { days: "Monday to Friday", time: "8:00 AM to 5:00 PM" },
  { days: "Saturday", time: "8:00 AM to 12:00 NN" },
  { days: "Sunday and holidays", time: "Emergency services only" },
];

export const OFFICIAL_POSITIONS = [
  "Punong Barangay",
  "Barangay Kagawad",
  "SK Chairperson",
  "Barangay Secretary",
  "Barangay Treasurer",
  "Other",
] as const;

export const BLOTTER_CATEGORIES = [
  "Theft",
  "Physical injury",
  "Threats",
  "Noise disturbance",
  "Property damage",
  "Trespassing",
  "Unpaid debt",
  "Boundary dispute",
  "Family dispute",
  "Animal-related",
  "Traffic incident",
  "Domestic violence",
  "Other",
] as const;

/** Offices created when a municipality is onboarded. The IT admin can rename, add, or turn them off. */
export const DEFAULT_OFFICES = [
  { name: "Office of the Municipal Mayor", acronym: "OMM" },
  { name: "Municipal Planning and Development Office", acronym: "MPDO" },
  { name: "Municipal Health Office", acronym: "MHO" },
  { name: "Municipal Social Welfare and Development Office", acronym: "MSWDO" },
  { name: "Municipal Peace and Order Council", acronym: "MPOC" },
  { name: "Municipal Disaster Risk Reduction and Management Office", acronym: "MDRRMO" },
  { name: "Municipal Agriculture Office", acronym: "MAO" },
  { name: "Department of the Interior and Local Government (Municipal)", acronym: "DILG" },
  { name: "Municipal Information Technology Office", acronym: "MITO" },
] as const;
