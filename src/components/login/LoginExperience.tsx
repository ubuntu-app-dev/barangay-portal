"use client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loginRoles, roleCopy } from "@/data/login-content";
import { useGeoOptions } from "@/hooks/use-geo-options";
import { geoQuery } from "@/lib/geo/query";
import { slugsFor } from "@/lib/slug";
import type { GeoOption } from "@/types/geo";
import type { LoginRole } from "@/types/login";
import CredentialsForm from "./CredentialsForm";
import GeoSelect from "./GeoSelect";
import LocationJourney, { type JourneyStep } from "./LocationJourney";
import LoginShell from "./LoginShell";
import RoleSwitch from "./RoleSwitch";

function StepIn({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const slugOf = (list: GeoOption[], option: GeoOption) =>
  slugsFor(list).get(option.code) ?? "";

export default function LoginExperience() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("secretary");
  const [region, setRegion] = useState<GeoOption | null>(null);
  const [province, setProvince] = useState<GeoOption | null>(null);
  const [municipality, setMunicipality] = useState<GeoOption | null>(null);
  const [barangay, setBarangay] = useState<GeoOption | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  const needsLocation = role !== "superadmin";
  const needsBarangay = role === "secretary";

  const regions = useGeoOptions(needsLocation ? geoQuery.regions() : null);
  const provinces = useGeoOptions(
    needsLocation && region ? geoQuery.provinces(region.code) : null,
  );
  const noProvinces =
    provinces.status === "ready" && provinces.options.length === 0; // e.g. NCR
  const provinceDone = !!province || noProvinces;
  const municipalities = useGeoOptions(
    needsLocation && region && provinceDone
      ? geoQuery.municipalities(region.code, province?.code)
      : null,
  );
  const barangays = useGeoOptions(
    needsBarangay && municipality
      ? geoQuery.barangays(municipality.code)
      : null,
  );

  /** /province/municipality[/barangay]. NCR and province-free cities use the region in place of a province. */
  const openSignIn = (city: GeoOption, brgy?: GeoOption) => {
    if (!region) return;
    const area =
      province && province.code !== city.code
        ? slugOf(provinces.options, province)
        : slugOf(regions.options, region);
    const parts = [
      area,
      slugOf(municipalities.options, city),
      ...(brgy ? [slugOf(barangays.options, brgy)] : []),
    ];
    setOpening(brgy?.name ?? city.name);
    router.push(`/${parts.join("/")}`);
  };

  const pickRegion = (o: GeoOption) => {
    setRegion(o);
    setProvince(null);
    setMunicipality(null);
    setBarangay(null);
    setOpening(null);
  };
  const pickProvince = (o: GeoOption) => {
    setProvince(o);
    setMunicipality(null);
    setBarangay(null);
    setOpening(null);
  };
  const pickMunicipality = (o: GeoOption) => {
    setMunicipality(o);
    setBarangay(null);
    setOpening(null);
    if (role === "municipal") openSignIn(o);
  };
  const pickBarangay = (o: GeoOption) => {
    setBarangay(o);
    if (municipality) openSignIn(municipality, o);
  };
  const changeRole = (next: LoginRole) => {
    setRole(next);
    setOpening(null);
    if (next !== "secretary") setBarangay(null);
  };

  const steps: JourneyStep[] = needsLocation
    ? [
        { key: "region", label: "Region", value: region?.name, done: !!region },
        {
          key: "province",
          label: "Province",
          value: noProvinces ? "Not applicable" : province?.name,
          done: provinceDone,
        },
        {
          key: "municipality",
          label: "City or municipality",
          value: municipality?.name,
          done: !!municipality,
        },
        ...(needsBarangay
          ? [
              {
                key: "barangay",
                label: "Barangay",
                value: barangay?.name,
                done: !!barangay,
              },
            ]
          : []),
      ]
    : [];
  const doneCount = steps.filter((s) => s.done).length;
  const complete = steps.every((s) => s.done);
  const progress = needsLocation ? doneCount / steps.length : 1;
  const roleInfo = loginRoles.find((r) => r.id === role) ?? loginRoles[0];

  return (
    <LoginShell
      progress={progress}
      journey={needsLocation ? <LocationJourney steps={steps} /> : undefined}
      headline={
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,3.2vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
              {roleCopy[role].title}
            </h2>
            <p className="mt-4 max-w-[38ch] text-on-field-secondary">
              {roleCopy[role].text}
            </p>
          </motion.div>
        </AnimatePresence>
      }
    >
      <RoleSwitch value={role} onChange={changeRole} />

      <div className="mt-8">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Sign in
        </h1>
        <p className="mt-1 text-[15px] text-ink-secondary">{roleInfo.system}</p>
        {needsLocation && (
          <div className="mt-4">
            <p
              aria-live="polite"
              className="text-[13px] font-semibold text-ink-secondary"
            >
              {complete
                ? "Opening your sign-in page"
                : `Step ${doneCount + 1} of ${steps.length}: choose your ${steps[doneCount]?.label.toLowerCase()}`}
            </p>
            <div aria-hidden="true" className="mt-2 flex gap-1.5">
              {steps.map((s) => (
                <span
                  key={s.key}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-rule"
                >
                  <motion.span
                    initial={false}
                    animate={{ scaleX: s.done ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="block h-full origin-left bg-brand"
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {needsLocation ? (
          <>
            <GeoSelect
              label="Region"
              placeholder="Choose your region"
              options={regions.options}
              value={region}
              onChange={pickRegion}
              status={regions.status}
              onRetry={regions.retry}
            />
            {region && (
              <StepIn>
                {noProvinces ? (
                  <p className="rounded-xl bg-ground-muted px-4 py-3 text-[14px] text-ink-secondary">
                    This region has no provinces. Continue with your city or
                    municipality.
                  </p>
                ) : (
                  <GeoSelect
                    label="Province or independent city"
                    placeholder="Choose your province or city"
                    options={provinces.options}
                    value={province}
                    onChange={pickProvince}
                    status={provinces.status}
                    onRetry={provinces.retry}
                    autoFocus
                  />
                )}
              </StepIn>
            )}
            {region && provinceDone && (
              <StepIn>
                <GeoSelect
                  label="City or municipality"
                  placeholder="Choose your city or municipality"
                  options={municipalities.options}
                  value={municipality}
                  onChange={pickMunicipality}
                  status={municipalities.status}
                  onRetry={municipalities.retry}
                  autoFocus
                />
              </StepIn>
            )}
            {needsBarangay && municipality && (
              <StepIn>
                <GeoSelect
                  label="Barangay"
                  placeholder="Choose your barangay"
                  options={barangays.options}
                  value={barangay}
                  onChange={pickBarangay}
                  status={barangays.status}
                  onRetry={barangays.retry}
                  autoFocus
                />
              </StepIn>
            )}
            {opening && (
              <StepIn>
                <p
                  role="status"
                  className="rounded-xl bg-brand/10 px-4 py-3 text-[15px] font-semibold text-brand"
                >
                  Opening the sign-in page for {opening}&hellip;
                </p>
              </StepIn>
            )}
          </>
        ) : (
          <CredentialsForm
            role="superadmin"
            location={{}}
            summary={[]}
            focusOnMount={false}
          />
        )}
      </div>
    </LoginShell>
  );
}
