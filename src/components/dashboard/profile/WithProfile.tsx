import type { ReactNode } from "react";
import { can } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { getBarangayProfile } from "@/lib/dashboard/profile";
import type { BarangayProfile } from "@/types/profile";

type Props = { render: (profile: BarangayProfile, canEdit: boolean) => ReactNode };

/** Loads the signed-in secretary's barangay profile and hands it to `render`. Errors go to the dashboard error boundary. */
export default async function WithProfile({ render }: Props) {
  const session = await requireSession();
  const profile = await getBarangayProfile(session.barangay.code);
  return <>{render(profile, can(session.permissions, "profile:edit"))}</>;
}
