export type Session = {
  user: {
    id: string;
    username: string;
    name: string;
    firstName: string;
    position: string;
    email: string | null;
    role: "secretary";
    mustChangePassword: boolean;
  };
  /** Comes from the signed-in account. The user can never pick or change it. */
  barangay: {
    code: string;
    name: string;
    municipality: string;
    municipalityCode: string;
    province: string;
  };
  permissions: string[];
};

export type Trend = { now: number; prev: number; good?: "up" | "down" };

export type DashboardStats = {
  residents: { total: number; newThisMonth: number; previousMonthNew: number };
  households: { total: number; newThisMonth: number; previousMonthNew: number };
  documents: { total: number; thisMonth: number; previousMonth: number };
  requests: { pending: number; processing: number; ready: number; receivedThisMonth: number; receivedLastMonth: number };
  incidents: { open: number; thisMonth: number; previousMonth: number };
  submissions: { awaitingSubmission: number; awaitingReview: number; returned: number };
};

export type ChartDatum = { label: string; value: number };
export type Demographics = {
  sex: ChartDatum[];
  ageGroups: ChartDatum[];
  households: ChartDatum[];
  classification: ChartDatum[];
};

export type Activity = {
  id: string;
  action: string;
  entity: string;
  description: string;
  performedBy: string;
  at: string;
};

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  office: string;
  publishedAt: string;
  priority: "Urgent" | "High" | "Normal";
};

export type Task = {
  id: string;
  title: string;
  category: string;
  due: string | null;
  status: string;
  href: string;
};

export type Submission = {
  id: string;
  report: string;
  submittedAt: string | null;
  office: string;
  status: string;
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
  barangayInfo: {
    captain: string;
    secretary: string;
    totalResidents: number;
    totalHouseholds: number;
    puroks: number;
  };
  stats: DashboardStats;
  demographics: Demographics;
  activities: Activity[];
  announcements: Announcement[];
  tasks: Task[];
  submissions: Submission[];
};
