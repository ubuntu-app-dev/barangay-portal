import { sampleDataEnabled } from "@/lib/auth/session";
import { sampleDashboard, sampleNotifications } from "./sample-data";
import type {
  AppNotification,
  DashboardData,
  Session,
} from "@/types/dashboard";

export class DashboardUnavailableError extends Error {
  constructor() {
    super("The dashboard data source is not connected yet.");
  }
}

/**
 * Everything is scoped to session.barangay.code. When the database exists, query it here with that code
 * and nothing else. Until then the dashboard shows an error state instead of inventing records.
 */
export async function getDashboardData(
  session: Session,
): Promise<DashboardData> {
  void session;
  if (sampleDataEnabled()) return sampleDashboard;
  throw new DashboardUnavailableError();
}

export async function getNotifications(
  session: Session,
): Promise<AppNotification[]> {
  void session;
  return sampleDataEnabled() ? sampleNotifications : [];
}

/** Counts shown as badges in the menu, keyed by menu item id. Empty until real data is connected. */
export async function getNavBadges(
  session: Session,
): Promise<Record<string, number>> {
  void session;
  if (!sampleDataEnabled()) return {};
  const { stats } = sampleDashboard;
  return {
    documents: stats.requests.pending,
    submissions: stats.submissions.awaitingSubmission,
    announcements: sampleNotifications.filter((n) => !n.read).length,
  };
}
