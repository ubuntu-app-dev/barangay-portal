import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import { activeResidents } from "@/server/queries/stats";
import { bornOnOrBefore } from "@/server/time";
import type { BarangayProfile } from "@/types/profile";

const year = (d: Date | null) => (d ? d.getUTCFullYear() : null);
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

/**
 * The profile of ONE barangay, selected by the code from the signed-in session (never from the URL).
 * Cached per request so the header and the page share one load.
 */
export const getBarangayProfile = cache(async (barangayCode: string): Promise<BarangayProfile> => {
  const b = await db.barangay.findUniqueOrThrow({
    where: { code: barangayCode },
    include: {
      municipality: { include: { province: true, region: true } },
      puroks: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { households: { where: { deletedAt: null } }, residents: { where: { deletedAt: null, status: "ACTIVE" } } } } } },
      officials: { orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }] },
      bodies: { orderBy: { acronym: "asc" } },
    },
  });
  const res = activeResidents(barangayCode);
  const [population, households, voters, seniors] = await Promise.all([
    db.resident.count({ where: res }),
    db.household.count({ where: { barangayCode, deletedAt: null } }),
    db.resident.count({ where: { ...res, isRegisteredVoter: true } }),
    db.resident.count({ where: { ...res, birthDate: { lte: bornOnOrBefore(60) } } }),
  ]);
  const m = b.municipality;

  return {
    general: {
      name: `Barangay ${b.name}`,
      code: b.code,
      municipality: m.name,
      province: m.province?.name ?? m.region.name,
      region: m.region.name,
      classification: b.classification === "URBAN" ? "Urban" : "Rural",
      classificationKey: b.classification,
      landAreaHectares: b.landAreaHectares ? Number(b.landAreaHectares) : null,
      dateEstablished: b.dateEstablished ? day(b.dateEstablished) : null,
      zipCode: b.zipCode ?? "",
      legislativeDistrict: b.legislativeDistrict ?? "",
    },
    glance: { population, households, registeredVoters: voters, seniorCitizens: seniors },
    boundaries: { north: b.boundaryNorth ?? "", east: b.boundaryEast ?? "", south: b.boundarySouth ?? "", west: b.boundaryWest ?? "" },
    puroks: b.puroks.map((p) => ({ label: p.name, value: p._count.households })),
    purokRows: b.puroks.map((p) => ({ id: p.id, name: p.name, households: p._count.households, residents: p._count.residents })),
    about: { history: b.history ?? "", vision: b.vision ?? "", mission: b.mission ?? "" },
    officials: b.officials.map((o) => ({
      id: o.id,
      name: o.name,
      position: o.position,
      committee: o.committee ?? "",
      termStart: day(o.termStart),
      termEnd: day(o.termEnd),
      term: o.termStart || o.termEnd ? `${year(o.termStart) ?? "?"} to ${year(o.termEnd) ?? "?"}` : "Term not set",
      contact: o.contact ?? "",
      email: o.email ?? "",
      isSignatory: o.isSignatory,
      isActive: o.isActive,
    })),
    bodies: b.bodies.map((x) => ({
      id: x.id,
      name: x.acronym,
      fullName: x.name,
      head: x.head ?? "",
      members: x.memberCount,
      status: x.isActive ? "Active" : "Inactive",
      description: x.description ?? "",
    })),
    contact: {
      address: b.address ?? "",
      landline: b.landline ?? "",
      mobile: b.mobile ?? "",
      email: b.email ?? "",
      facebook: b.facebook ?? "",
      hours: Array.isArray(b.officeHours) ? (b.officeHours as { days: string; time: string }[]) : [],
      hotlines: Array.isArray(b.hotlines) ? (b.hotlines as { name: string; number: string; note?: string }[]) : [],
    },
  };
});
