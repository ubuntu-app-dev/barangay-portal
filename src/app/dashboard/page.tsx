import { Suspense } from "react";
import AnnouncementsPanel from "@/components/dashboard/overview/AnnouncementsPanel";
import BarangayInfoCard from "@/components/dashboard/overview/BarangayInfoCard";
import DemographicsSection from "@/components/dashboard/overview/DemographicsSection";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import RecentActivities from "@/components/dashboard/overview/RecentActivities";
import StatCards from "@/components/dashboard/overview/StatCards";
import SubmissionsPanel from "@/components/dashboard/overview/SubmissionsPanel";
import TasksPanel from "@/components/dashboard/overview/TasksPanel";
import WelcomeHeader from "@/components/dashboard/overview/WelcomeHeader";
import { DashboardSkeleton } from "@/components/dashboard/ui/Skeleton";
import { requireSession } from "@/lib/auth/session";
import { getDashboardData, getNotifications } from "@/lib/dashboard/data";

async function DashboardContent() {
  const session = await requireSession();
  const [data, notifications] = await Promise.all([getDashboardData(session), getNotifications(session)]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <WelcomeHeader session={session} unread={unread} tasks={data.tasks.length} />
      <QuickActions />
      <StatCards stats={data.stats} />
      <div className="grid gap-6 xl:grid-cols-3">
        <TasksPanel items={data.tasks} className="xl:col-span-2" />
        <BarangayInfoCard session={session} info={data.barangayInfo} />
      </div>
      <DemographicsSection data={data.demographics} />
      <div className="grid gap-6 xl:grid-cols-2">
        <AnnouncementsPanel items={data.announcements} />
        <RecentActivities rows={data.activities} />
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
