import { Suspense } from "react";
import AnnouncementsPanel from "@/components/dashboard/overview/AnnouncementsPanel";
import BarangayInfoCard from "@/components/dashboard/overview/BarangayInfoCard";
import DemographicsSection from "@/components/dashboard/overview/DemographicsSection";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import RecentActivities from "@/components/dashboard/overview/RecentActivities";
import SampleDataBanner from "@/components/dashboard/overview/SampleDataBanner";
import StatCards from "@/components/dashboard/overview/StatCards";
import SubmissionsPanel from "@/components/dashboard/overview/SubmissionsPanel";
import TasksPanel from "@/components/dashboard/overview/TasksPanel";
import WelcomeHeader from "@/components/dashboard/overview/WelcomeHeader";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import {
  DashboardUnavailableError,
  getDashboardData,
  getNotifications,
} from "@/lib/dashboard/data";
import type { DashboardData } from "@/types/dashboard";

async function DashboardContent() {
  const session = await requireSession();

  let data: DashboardData;
  try {
    data = await getDashboardData(session);
  } catch (error) {
    console.error(
      "[dashboard]",
      error instanceof Error ? error.message : "unknown error",
    );
    return (
      <ErrorState
        title="The dashboard could not load"
        text={
          error instanceof DashboardUnavailableError
            ? "The barangay data source is not connected yet."
            : "Something went wrong while loading your barangay's data. Please try again."
        }
        retryHref={routes.home}
      />
    );
  }

  const unread = (await getNotifications(session)).filter(
    (n) => !n.read,
  ).length;

  return (
    <div className="space-y-6">
      {data.source === "sample" && <SampleDataBanner />}
      <WelcomeHeader session={session} unread={unread} />
      <StatCards stats={data.stats} />
      <QuickActions />
      <div className="grid gap-6 xl:grid-cols-3">
        <BarangayInfoCard session={session} info={data.barangayInfo} />
        <DemographicsSection
          data={data.demographics}
          className="xl:col-span-2"
        />
      </div>
      <RecentActivities rows={data.activities} />
      <div className="grid gap-6 xl:grid-cols-2">
        <AnnouncementsPanel items={data.announcements} />
        <TasksPanel items={data.tasks} />
      </div>
      <SubmissionsPanel rows={data.submissions} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
