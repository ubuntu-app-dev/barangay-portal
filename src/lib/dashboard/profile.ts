import { cache } from "react";
import { sampleDataEnabled } from "@/lib/auth/session";
import { DashboardUnavailableError } from "./data";
import { sampleProfile } from "./sample-profile";
import type { BarangayProfile } from "@/types/profile";

/**
 * The profile of ONE barangay, selected by the code from the signed-in session (never from the URL).
 * Replace the body with a database query filtered by that code. Until then: sample data or an error state.
 * Cached per request so the header and the page share one load.
 */
export const getBarangayProfile = cache(
  async (barangayCode: string): Promise<BarangayProfile> => {
    void barangayCode;
    if (sampleDataEnabled()) return sampleProfile;
    throw new DashboardUnavailableError();
  },
);
