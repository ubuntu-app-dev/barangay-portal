/**
 * Step-by-step guides and FAQs for the Barangay Secretary. Shown on the Help page and used by
 * the AI assistant as part of its knowledge, so the two never disagree.
 */
import type { IconName } from "@/components/dashboard/ui/icon-paths";
import { routes } from "@/config/navigation";

export const SECRETARY_GUIDES: { icon: IconName; title: string; href: string; steps: string[] }[] = [
  {
    icon: "userPlus",
    title: "Register a resident",
    href: routes.addResident,
    steps: ["Add the household first if it is new (Households → Add household).", "Open Add New Resident and fill in the required fields.", "Pick the household and the relationship to its head.", "Tick the classifications that apply (voter, PWD, solo parent, 4Ps)."],
  },
  {
    icon: "fileCheck",
    title: "Issue a certificate",
    href: routes.issueCertificate,
    steps: ["Open Certificate Issuance, or click Issue on a request.", "Pick the document and the resident, and type the purpose.", "Enter the O.R. number if there is a fee, check the preview, then Issue.", "Print. Each print is counted; voided documents cannot be printed again."],
  },
  {
    icon: "shield",
    title: "Record an incident or complaint",
    href: routes.newIncident,
    steps: ["Choose Incident report or Complaint.", "Add the complainant (a resident, or type the name of an outsider).", "Complaints need a respondent. Save to get a blotter number.", "From the entry, file it as a KP case to start the 15-day mediation period."],
  },
  {
    icon: "send",
    title: "Submit a report to the municipality",
    href: routes.pendingSubmissions,
    steps: ["Open Pending Submissions to see what is due.", "Click Prepare. The figures are generated from your records.", "Add notes for anything unusual, then submit.", "If it is returned, read the remarks, fix your records, and resubmit."],
  },
];

export const SECRETARY_FAQ: [string, string][] = [
  ["I forgot my password.", "Ask your municipal IT administrator to reset it. For security, passwords cannot be recovered by email yet."],
  ["I registered a resident twice.", "Open the duplicate record and use Archive with the reason “duplicate of R-…”. It stays in the change history."],
  ["A certificate has a wrong name.", "Void it from Issuance History with the reason, correct the resident record, then issue a new one."],
  ["Why can't I see VAWC records?", "VAWC cases are confidential under RA 9262. Only the designated VAW desk officer gets access, granted by the municipal IT administrator."],
  ["Who can see my barangay's records?", "Only accounts assigned to your barangay. The municipality sees only the reports you submit."],
  ["Can I change the certificate fees?", "Yes: open the certificate's page and click Fee and requirements. Follow your barangay's approved schedule of fees."],
];
