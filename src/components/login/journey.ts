import type { LoginRole } from "@/types/login";
import type { ResolvedLocation } from "@/types/geo";
import type { JourneyStep } from "./LocationJourney";

/** The journey list for a location that is already fully chosen (used on the sign-in pages). */
export function completedSteps(
  location: ResolvedLocation,
  role: Exclude<LoginRole, "superadmin">,
): JourneyStep[] {
  return [
    { key: "region", label: "Region", value: location.region.name, done: true },
    {
      key: "province",
      label: "Province",
      value: location.province?.name ?? "Not applicable",
      done: true,
    },
    {
      key: "municipality",
      label: "City or municipality",
      value: location.municipality.name,
      done: true,
    },
    ...(role === "secretary" && location.barangay
      ? [
          {
            key: "barangay",
            label: "Barangay",
            value: location.barangay.name,
            done: true,
          },
        ]
      : []),
  ];
}
