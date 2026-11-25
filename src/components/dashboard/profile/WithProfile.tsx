import type { ReactNode } from "react";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import { routes } from "@/config/navigation";
import { requireSession } from "@/lib/auth/session";
import { DashboardUnavailableError } from "@/lib/dashboard/data";
import { getBarangayProfile } from "@/lib/dashboard/profile";
import type { BarangayProfile } from "@/types/profile";

type Props = { render: (profile: BarangayProfile) => ReactNode; errorFallback?: ReactNode };

/** Loads the signed-in secretary's barangay profile and hands it to `render`, with the error state handled once. */
export default async function WithProfile({ render, errorFallback }: Props) {
  const session = await requireSession();
  try {
    return <>{render(await getBarangayProfile(session.barangay.code))}</>;
  } catch (error) {
    console.error("[profile]", error instanceof Error ? error.message : "unknown error");
    if (errorFallback !== undefined) return <>{errorFallback}</>;
    return (
      <ErrorState
        title="The profile could not load"
        text={error instanceof DashboardUnavailableError ? "The barangay data source is not connected yet." : "Something went wrong while loading the barangay profile. Please try again."}
        retryHref={routes.profile}
      />
    );
  }
}
