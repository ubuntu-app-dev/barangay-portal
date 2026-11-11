import CredentialsForm from "./CredentialsForm";
import LocationJourney from "./LocationJourney";
import LoginShell from "./LoginShell";
import { completedSteps } from "./journey";
import { ROUTES } from "@/lib/routes";
import type { ResolvedLocation } from "@/types/geo";
import type { LoginRole } from "@/types/login";

type Props = {
  role: Exclude<LoginRole, "superadmin">;
  location: ResolvedLocation;
};

/** The sign-in page for one barangay (secretary) or one municipality (municipal personnel). */
export default function LocationSignIn({ role, location }: Props) {
  const secretary = role === "secretary";
  const place = secretary
    ? (location.barangay?.name ?? "")
    : location.municipality.name;
  const where = [
    secretary ? location.municipality.name : null,
    location.province?.name ?? location.region.name,
  ]
    .filter(Boolean)
    .join(", ");
  const chips = [
    ...new Set(
      [
        secretary ? location.barangay?.name : null,
        location.municipality.name,
        location.province?.name ?? location.region.name,
      ].filter((s): s is string => !!s),
    ),
  ];

  return (
    <LoginShell
      progress={1}
      journey={<LocationJourney steps={completedSteps(location, role)} />}
      headline={
        <>
          <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,3.2vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Sign in for {place}
          </h2>
          <p className="mt-4 max-w-[38ch] text-on-field-secondary">
            {where ? `${where}. ` : ""}Use your{" "}
            {secretary ? "Barangay Information System" : "Municipal System"}{" "}
            account.
          </p>
        </>
      }
    >
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
        Sign in
      </h1>
      <p className="mt-1 text-[15px] text-ink-secondary">
        {secretary ? "Barangay Information System" : "Municipal System"}
      </p>
      <div className="mt-6">
        <CredentialsForm
          role={role}
          focusOnMount
          summary={chips}
          changeHref={ROUTES.login}
          location={{
            regionCode: location.region.code,
            provinceCode: location.province?.code,
            municipalityCode: location.municipality.code,
            barangayCode: location.barangay?.code,
          }}
        />
      </div>
    </LoginShell>
  );
}
