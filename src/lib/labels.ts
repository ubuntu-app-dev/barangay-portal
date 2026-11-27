/** Display text for database enums. Safe for client and server. */
export const SEX = { MALE: "Male", FEMALE: "Female" } as const;
export const CIVIL_STATUS = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
  ANNULLED: "Annulled",
  LIVE_IN: "Live-in",
} as const;
export const RESIDENT_STATUS = { ACTIVE: "Active", MOVED_OUT: "Moved Out", DECEASED: "Deceased" } as const;
export const RELATIONSHIP = {
  HEAD: "Head",
  SPOUSE: "Spouse",
  SON: "Son",
  DAUGHTER: "Daughter",
  FATHER: "Father",
  MOTHER: "Mother",
  SIBLING: "Sibling",
  GRANDCHILD: "Grandchild",
  GRANDPARENT: "Grandparent",
  IN_LAW: "In-law",
  RELATIVE: "Other relative",
  BOARDER: "Boarder",
  HELPER: "Household helper",
  OTHER: "Other",
} as const;
export const EDUCATION = {
  NONE: "No formal education",
  ELEMENTARY_LEVEL: "Elementary level",
  ELEMENTARY_GRADUATE: "Elementary graduate",
  HIGH_SCHOOL_LEVEL: "High school level",
  HIGH_SCHOOL_GRADUATE: "High school graduate",
  SENIOR_HIGH: "Senior high school",
  VOCATIONAL: "Vocational",
  COLLEGE_LEVEL: "College level",
  COLLEGE_GRADUATE: "College graduate",
  POST_GRADUATE: "Post-graduate",
} as const;
export const TENURE = { OWNED: "Owned", RENTED: "Rented", SHARED: "Shared / rent-free", INFORMAL: "Informal settler", OTHER: "Other" } as const;
export const WATER = {
  LEVEL_III: "Level III: house connection",
  LEVEL_II: "Level II: communal faucet",
  LEVEL_I: "Level I: point source (well, spring)",
  DELIVERED: "Delivered / refilling station",
  OTHER: "Other",
} as const;
export const WATER_SHORT = { LEVEL_III: "Level III", LEVEL_II: "Level II", LEVEL_I: "Level I", DELIVERED: "Delivered", OTHER: "Other" } as const;
export const TOILET = { WATER_SEALED: "Water-sealed", POUR_FLUSH: "Pour flush", PIT_LATRINE: "Pit latrine", SHARED: "Shared", NONE: "None" } as const;
export const REQUEST_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  READY_FOR_RELEASE: "Ready for Release",
  RELEASED: "Released",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;
export const CHANNEL = { WALK_IN: "Walk-in", ONLINE: "Online" } as const;
export const BLOTTER_KIND = { INCIDENT: "Incident", COMPLAINT: "Complaint" } as const;
export const BLOTTER_STATUS = {
  OPEN: "Open",
  UNDER_MEDIATION: "Under Mediation",
  UNDER_CONCILIATION: "Under Conciliation",
  UNDER_ARBITRATION: "Under Arbitration",
  SETTLED: "Settled",
  REFERRED: "Referred",
  CERTIFIED_TO_FILE_ACTION: "Certified to File Action",
  DISMISSED: "Dismissed",
  CLOSED: "Closed",
} as const;
export const KP_STAGE = { MEDIATION: "Mediation", CONCILIATION: "Conciliation", ARBITRATION: "Arbitration" } as const;
export const PARTY_ROLE = { COMPLAINANT: "Complainant", RESPONDENT: "Respondent", VICTIM: "Victim", WITNESS: "Witness" } as const;
export const HEARING_OUTCOME = {
  SCHEDULED: "Scheduled",
  HELD: "Held",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No Show",
  SETTLED: "Settled",
  FAILED: "Failed",
} as const;
export const SPECIES = {
  DOG: "Dog",
  CAT: "Cat",
  CARABAO: "Carabao",
  CATTLE: "Cattle",
  GOAT: "Goat",
  PIG: "Pig",
  HORSE: "Horse",
  POULTRY: "Poultry",
  OTHER: "Other",
} as const;
export const ANIMAL_STATUS = { ACTIVE: "Active", DECEASED: "Deceased", TRANSFERRED: "Transferred", MISSING: "Missing" } as const;
export const RESOURCE_CATEGORY = {
  FACILITY: "Facility",
  EQUIPMENT: "Equipment",
  VEHICLE: "Vehicle",
  WATER_SYSTEM: "Water system",
  EVACUATION_CENTER: "Evacuation center",
  HEALTH: "Health",
  LAND: "Land",
  OTHER: "Other",
} as const;
export const CONDITION = { GOOD: "Good", FAIR: "Fair", POOR: "Poor", UNSERVICEABLE: "Unserviceable" } as const;
export const REPORT_KIND = {
  DEMOGRAPHICS: "Resident Demographics",
  HOUSEHOLDS: "Household Statistics",
  CERTIFICATES: "Certificate Issuance",
  BLOTTER: "Blotter and Incidents",
  COMMUNITY_RESOURCES: "Community Resources",
  BARANGAY_PROFILE: "Barangay Profile",
  OTHER: "Other",
} as const;
export const FREQUENCY = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", SEMESTRAL: "Semestral", ANNUAL: "Annual", ONE_TIME: "One-time" } as const;
export const SUBMISSION_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  RETURNED: "Returned for Revision",
} as const;
export const PRIORITY = { URGENT: "Urgent", HIGH: "High", NORMAL: "Normal" } as const;
export const AUDIT_ACTION = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  RESTORE: "Restored",
  ISSUE: "Issued",
  VOID: "Voided",
  SUBMIT: "Submitted",
  REVIEW: "Reviewed",
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  LOGIN_FAILED: "Failed sign-in",
  PASSWORD_CHANGE: "Password changed",
  PASSWORD_RESET: "Password reset",
  EXPORT: "Exported",
} as const;

export const label = <M extends Record<string, string>>(map: M, key: string | null | undefined) =>
  key ? ((map as Record<string, string>)[key] ?? key) : "";

export const options = <M extends Record<string, string>>(map: M) =>
  Object.entries(map).map(([value, label]) => ({ value, label }));

/** Human-readable field names for the change history. */
export const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  middleName: "Middle name",
  lastName: "Last name",
  suffix: "Suffix",
  sex: "Sex",
  birthDate: "Birth date",
  birthPlace: "Birth place",
  civilStatus: "Civil status",
  religion: "Religion",
  occupation: "Occupation",
  education: "Education",
  contactNumber: "Contact number",
  email: "Email",
  address: "Address",
  purokId: "Purok",
  residentSince: "Resident since",
  householdId: "Household",
  relationship: "Relationship",
  isRegisteredVoter: "Registered voter",
  voterPrecinct: "Precinct",
  isPwd: "PWD",
  isSoloParent: "Solo parent",
  is4Ps: "4Ps",
  isIndigenous: "Indigenous",
  isOfw: "OFW",
  isOutOfSchoolYouth: "Out-of-school youth",
  status: "Status",
  waterSource: "Water source",
  tenure: "Tenure",
  toilet: "Toilet",
  hasElectricity: "Electricity",
  monthlyIncome: "Monthly income",
};
