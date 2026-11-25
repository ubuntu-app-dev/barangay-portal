import type { AppNotification, DashboardData, Session } from "@/types/dashboard";

/**
 * SAMPLE DATA for UI prototyping only. Nothing here is a real barangay record.
 * The dashboard shows a "Sample data" banner whenever it is used.
 */
export const sampleSession: Session = {
  user: { id: "sample-user", name: "Maria Elena Santos", position: "Barangay Secretary", role: "secretary" },
  barangay: { code: "0000000000", name: "Barangay San Isidro", municipality: "Sample Municipality", province: "Sample Province" },
  // No "vawc:view": the VAWC menu item shows as restricted.
  permissions: ["residents:manage", "documents:issue", "incidents:record", "reports:submit"],
};

export const sampleNotifications: AppNotification[] = [
  { id: "n1", title: "Urgent advisory", body: "Dengue prevention advisory from the Municipal Health Office.", at: "2026-11-15T08:30:00+08:00", read: false, href: "/dashboard/announcements-and-communications/important-advisories" },
  { id: "n2", title: "Report returned", body: "The Monthly Blotter Report needs revision.", at: "2026-11-14T16:05:00+08:00", read: false, href: "/dashboard/municipal-submissions/submission-status" },
  { id: "n3", title: "New certificate request", body: "A Barangay Clearance request is waiting for processing.", at: "2026-11-14T10:12:00+08:00", read: true, href: "/dashboard/document-management/certificate-requests" },
  { id: "n4", title: "Reminder", body: "Q4 Barangay Profile Update is due on November 30.", at: "2026-11-12T09:00:00+08:00", read: true, href: "/dashboard/municipal-submissions/pending-submissions" },
];

export const sampleDashboard: DashboardData = {
  source: "sample",
  barangayInfo: { captain: "Hon. Ricardo D. Villanueva", secretary: "Maria Elena Santos", totalResidents: 8412, totalHouseholds: 2016 },
  stats: {
    residents: { total: 8412, newThisMonth: 37, previousMonthNew: 29 },
    households: { total: 2016, newThisMonth: 9, previousMonthNew: 12 },
    documents: { total: 5184, thisMonth: 142, previousMonth: 131 },
    requests: { pending: 18, processing: 7, previousPending: 22 },
    incidents: { total: 326, thisMonth: 11, previousMonth: 14 },
    submissions: { awaitingSubmission: 3, awaitingReview: 2, previousAwaitingSubmission: 4 },
  },
  demographics: {
    sex: [{ label: "Male", value: 4105 }, { label: "Female", value: 4307 }],
    ageGroups: [{ label: "0 to 14", value: 1988 }, { label: "15 to 24", value: 1402 }, { label: "25 to 39", value: 1951 }, { label: "40 to 59", value: 1897 }, { label: "60 and above", value: 1174 }],
    households: [{ label: "1 to 2 members", value: 512 }, { label: "3 to 4 members", value: 903 }, { label: "5 to 6 members", value: 436 }, { label: "7 or more", value: 165 }],
    classification: [{ label: "Registered voters", value: 5420 }, { label: "Senior citizens", value: 1031 }, { label: "4Ps beneficiaries", value: 296 }, { label: "Persons with disability", value: 214 }, { label: "Solo parents", value: 138 }],
  },
  activities: [
    { id: "a1", activity: "New resident registered", description: "Resident record created (R-08413).", performedBy: "Maria Elena Santos", at: "2026-11-15T09:42:00+08:00", status: "Completed" },
    { id: "a2", activity: "Barangay clearance issued", description: "Clearance BC-2026-0412 issued.", performedBy: "Maria Elena Santos", at: "2026-11-15T09:10:00+08:00", status: "Completed" },
    { id: "a3", activity: "Household information updated", description: "Household HH-1187 composition updated.", performedBy: "Maria Elena Santos", at: "2026-11-14T15:48:00+08:00", status: "Completed" },
    { id: "a4", activity: "New incident recorded", description: "Blotter entry B-2026-0121 opened.", performedBy: "Maria Elena Santos", at: "2026-11-14T13:22:00+08:00", status: "In Progress" },
    { id: "a5", activity: "Municipal report submitted", description: "Monthly Certificate Issuance Report sent.", performedBy: "Maria Elena Santos", at: "2026-11-13T11:05:00+08:00", status: "Completed" },
    { id: "a6", activity: "Certificate request received", description: "Certificate of Indigency request CR-2026-0733.", performedBy: "System", at: "2026-11-13T08:40:00+08:00", status: "Pending" },
    { id: "a7", activity: "Resident classification updated", description: "Senior citizen status verified (R-02210).", performedBy: "Maria Elena Santos", at: "2026-11-12T16:30:00+08:00", status: "Completed" },
    { id: "a8", activity: "Report returned for revision", description: "Monthly Blotter Report returned by the municipality.", performedBy: "Municipal Office", at: "2026-11-12T10:15:00+08:00", status: "Needs Attention" },
    { id: "a9", activity: "Certificate of residency issued", description: "Certificate CR-2026-0731 issued.", performedBy: "Maria Elena Santos", at: "2026-11-11T14:02:00+08:00", status: "Completed" },
    { id: "a10", activity: "Resident address corrected", description: "Record R-05118 updated and logged.", performedBy: "Maria Elena Santos", at: "2026-11-11T09:36:00+08:00", status: "Completed" },
  ],
  announcements: [
    { id: "m1", title: "Dengue prevention advisory", summary: "Clean-up drives and reporting of suspected cases are required in all barangays this week.", office: "Municipal Health Office", publishedAt: "2026-11-15", priority: "Urgent" },
    { id: "m2", title: "Q4 Barangay Profile Update", summary: "Submit the updated barangay profile on or before November 30.", office: "Municipal Planning and Development Office", publishedAt: "2026-11-10", priority: "High" },
    { id: "m3", title: "Revised barangay assembly schedule", summary: "The year-end assembly moves to the first week of December.", office: "Office of the Municipal Mayor", publishedAt: "2026-11-08", priority: "Normal" },
    { id: "m4", title: "Updated certificate templates", summary: "Use the new certificate templates starting December 1.", office: "Municipal Administrator's Office", publishedAt: "2026-11-05", priority: "Normal" },
  ],
  tasks: [
    { id: "t1", title: "Submit Q4 Barangay Profile Update", category: "Municipal requirement", due: "2026-11-30", status: "In Progress" },
    { id: "t2", title: "Revise and resubmit the Monthly Blotter Report", category: "Report requiring submission", due: "2026-11-18", status: "Returned for Revision" },
    { id: "t3", title: "Process 18 pending certificate requests", category: "Pending document requests", due: "2026-11-17", status: "Pending" },
    { id: "t4", title: "Complete 23 incomplete resident records", category: "Incomplete barangay records", due: "2026-11-20", status: "In Progress" },
    { id: "t5", title: "Submit the Monthly Inventory of Community Resources", category: "Report requiring submission", due: "2026-11-10", status: "Overdue" },
    { id: "t6", title: "October Certificate Issuance Report", category: "Municipal requirement", due: "2026-11-05", status: "Approved" },
  ],
  submissions: [
    { id: "s1", report: "Monthly Certificate Issuance Report (October)", submittedAt: "2026-11-13", office: "Municipal Administrator's Office", status: "Under Review", remarks: "Awaiting reviewer." },
    { id: "s2", report: "Monthly Blotter Report (October)", submittedAt: "2026-11-05", office: "Municipal Peace and Order Office", status: "Returned for Revision", remarks: "Add case status for entries 110 to 118." },
    { id: "s3", report: "Resident Demographics Update (Q3)", submittedAt: "2026-10-12", office: "Municipal Planning and Development Office", status: "Approved", remarks: "Accepted." },
    { id: "s4", report: "Household Statistics (Q3)", submittedAt: "2026-10-12", office: "Municipal Planning and Development Office", status: "Approved", remarks: "Accepted." },
    { id: "s5", report: "Community Resource Inventory (September)", submittedAt: "2026-10-04", office: "Municipal Agriculture Office", status: "Received", remarks: "Logged by the office." },
    { id: "s6", report: "Monthly Blotter Report (September)", submittedAt: "2026-10-03", office: "Municipal Peace and Order Office", status: "Approved", remarks: "Accepted." },
  ],
};
