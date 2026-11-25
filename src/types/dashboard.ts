export type Session = {
  user: { id: string; name: string; position: string; role: "secretary" };
  /** Comes from the signed-in account. The user can never pick or change it. */
  barangay: {
    code: string;
    name: string;
    municipality: string;
    province: string;
  };
  permissions: string[];
};

export type DashboardStats = {
  residents: { total: number; newThisMonth: number; previousMonthNew: number };
  households: { total: number; newThisMonth: number; previousMonthNew: number };
  documents: { total: number; thisMonth: number; previousMonth: number };
  requests: { pending: number; processing: number; previousPending: number };
  incidents: { total: number; thisMonth: number; previousMonth: number };
  submissions: {
    awaitingSubmission: number;
    awaitingReview: number;
    previousAwaitingSubmission: number;
  };
};

export type ChartDatum = { label: string; value: number };
export type Demographics = {
  sex: ChartDatum[];
  ageGroups: ChartDatum[];
  households: ChartDatum[];
  classification: ChartDatum[];
};

export type ActivityStatus =
  | "Completed"
  | "In Progress"
  | "Pending"
  | "Needs Attention";
export type Activity = {
  id: string;
  activity: string;
  description: string;
  performedBy: string;
  at: string;
  status: ActivityStatus;
};

export type Priority = "Urgent" | "High" | "Normal";
export type Announcement = {
  id: string;
  title: string;
  summary: string;
  office: string;
  publishedAt: string;
  priority: Priority;
};

export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Submitted"
  | "Approved"
  | "Returned for Revision"
  | "Overdue";
export type Task = {
  id: string;
  title: string;
  category: string;
  due: string;
  status: TaskStatus;
};

export type SubmissionStatus =
  | "Received"
  | "Under Review"
  | "Approved"
  | "Returned for Revision";
export type Submission = {
  id: string;
  report: string;
  submittedAt: string;
  office: string;
  status: SubmissionStatus;
  remarks: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
};

export type DashboardData = {
  /** "sample" means placeholder data for UI prototyping, never real barangay records. */
  source: "sample" | "live";
  barangayInfo: {
    captain: string;
    secretary: string;
    totalResidents: number;
    totalHouseholds: number;
  };
  stats: DashboardStats;
  demographics: Demographics;
  activities: Activity[];
  announcements: Announcement[];
  tasks: Task[];
  submissions: Submission[];
};
