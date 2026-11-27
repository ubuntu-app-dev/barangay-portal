import "server-only";
import { db } from "@/server/db";
import {
  BLOTTER_STATUS,
  CIVIL_STATUS,
  CONDITION,
  EDUCATION,
  RESOURCE_CATEGORY,
  SPECIES,
  TENURE,
  TOILET,
  WATER_SHORT,
  label,
} from "@/lib/labels";
import type { ChartDatum } from "@/types/dashboard";

/** Active residents of one barangay. Every statistic starts from this filter. */
export const activeResidents = (code: string) => ({ barangayCode: code, deletedAt: null, status: "ACTIVE" as const });
export const activeHouseholds = (code: string) => ({ barangayCode: code, deletedAt: null });

const AGE_GROUPS = ["0 to 14", "15 to 24", "25 to 39", "40 to 59", "60 and above"];

const toData = <K extends string>(rows: { key: K | null; count: number }[], map?: Record<string, string>, order?: string[]): ChartDatum[] => {
  const out = rows.map((r) => ({ label: map ? label(map, r.key ?? "") || "Not set" : (r.key ?? "Not set"), value: r.count }));
  if (order) out.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  else out.sort((a, b) => b.value - a.value);
  return out;
};

export async function residentDemographics(code: string) {
  const where = activeResidents(code);
  const [total, sex, civil, education, ages, voters, seniors, pwd, solo, fourPs, ip, ofw, osy, purok] = await Promise.all([
    db.resident.count({ where }),
    db.resident.groupBy({ by: ["sex"], where, _count: true }),
    db.resident.groupBy({ by: ["civilStatus"], where, _count: true }),
    db.resident.groupBy({ by: ["education"], where, _count: true }),
    db.$queryRaw<{ grp: string; count: bigint }[]>`
      SELECT CASE
        WHEN a < 15 THEN '0 to 14' WHEN a < 25 THEN '15 to 24' WHEN a < 40 THEN '25 to 39'
        WHEN a < 60 THEN '40 to 59' ELSE '60 and above' END AS grp, count(*) AS count
      FROM (SELECT date_part('year', age(now(), "birthDate"))::int AS a FROM "Resident"
            WHERE "barangayCode" = ${code} AND "deletedAt" IS NULL AND status = 'ACTIVE') t
      GROUP BY grp`,
    db.resident.count({ where: { ...where, isRegisteredVoter: true } }),
    db.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) AS count FROM "Resident"
      WHERE "barangayCode" = ${code} AND "deletedAt" IS NULL AND status = 'ACTIVE'
        AND "birthDate" <= (now() - interval '60 years')`,
    db.resident.count({ where: { ...where, isPwd: true } }),
    db.resident.count({ where: { ...where, isSoloParent: true } }),
    db.resident.count({ where: { ...where, is4Ps: true } }),
    db.resident.count({ where: { ...where, isIndigenous: true } }),
    db.resident.count({ where: { ...where, isOfw: true } }),
    db.resident.count({ where: { ...where, isOutOfSchoolYouth: true } }),
    db.resident.groupBy({ by: ["purokId"], where, _count: true }),
  ]);
  const puroks = await db.purok.findMany({ where: { barangayCode: code }, orderBy: { sortOrder: "asc" } });
  const seniorCount = Number(seniors[0]?.count ?? 0);

  return {
    total,
    sex: toData(sex.map((s) => ({ key: s.sex, count: s._count })), { MALE: "Male", FEMALE: "Female" }, ["Male", "Female"]),
    ageGroups: AGE_GROUPS.map((g) => ({ label: g, value: Number(ages.find((a) => a.grp === g)?.count ?? 0) })),
    civilStatus: toData(civil.map((s) => ({ key: s.civilStatus, count: s._count })), CIVIL_STATUS),
    education: toData(education.map((s) => ({ key: s.education, count: s._count })), EDUCATION),
    byPurok: puroks.map((p) => ({ label: p.name, value: purok.find((x) => x.purokId === p.id)?._count ?? 0 })),
    classification: [
      { label: "Registered voters", value: voters },
      { label: "Senior citizens (60+)", value: seniorCount },
      { label: "Persons with disability", value: pwd },
      { label: "Solo parents", value: solo },
      { label: "4Ps beneficiaries", value: fourPs },
      { label: "Out-of-school youth", value: osy },
      { label: "OFWs", value: ofw },
      { label: "Indigenous peoples", value: ip },
    ],
    voters,
    seniors: seniorCount,
  };
}

export async function householdStatistics(code: string) {
  const where = activeHouseholds(code);
  const [total, water, tenure, toilet, electricity, sizes, purok] = await Promise.all([
    db.household.count({ where }),
    db.household.groupBy({ by: ["waterSource"], where, _count: true }),
    db.household.groupBy({ by: ["tenure"], where, _count: true }),
    db.household.groupBy({ by: ["toilet"], where, _count: true }),
    db.household.count({ where: { ...where, hasElectricity: true } }),
    db.resident.groupBy({ by: ["householdId"], where: { ...activeResidents(code), householdId: { not: null } }, _count: true }),
    db.household.groupBy({ by: ["purokId"], where, _count: true }),
  ]);
  const puroks = await db.purok.findMany({ where: { barangayCode: code }, orderBy: { sortOrder: "asc" } });
  const bucket = (n: number) => (n <= 2 ? "1 to 2 members" : n <= 4 ? "3 to 4 members" : n <= 6 ? "5 to 6 members" : "7 or more");
  const sizeOrder = ["1 to 2 members", "3 to 4 members", "5 to 6 members", "7 or more"];
  const sizeCounts = new Map<string, number>();
  let members = 0;
  for (const s of sizes) {
    members += s._count;
    const b = bucket(s._count);
    sizeCounts.set(b, (sizeCounts.get(b) ?? 0) + 1);
  }
  return {
    total,
    averageSize: sizes.length ? members / sizes.length : 0,
    withElectricity: electricity,
    sizes: sizeOrder.map((l) => ({ label: l, value: sizeCounts.get(l) ?? 0 })),
    water: toData(water.map((w) => ({ key: w.waterSource, count: w._count })), WATER_SHORT, Object.values(WATER_SHORT)),
    tenure: toData(tenure.map((w) => ({ key: w.tenure, count: w._count })), TENURE),
    toilet: toData(toilet.map((w) => ({ key: w.toilet, count: w._count })), TOILET),
    byPurok: puroks.map((p) => ({ label: p.name, value: purok.find((x) => x.purokId === p.id)?._count ?? 0 })),
  };
}

export async function certificateStatistics(code: string, from: Date, to: Date) {
  const where = { barangayCode: code, issuedAt: { gte: from, lt: to } };
  const [types, byType, voided, fees, requests] = await Promise.all([
    db.documentType.findMany({ where: { barangayCode: code }, orderBy: { sortOrder: "asc" } }),
    db.issuedDocument.groupBy({ by: ["documentTypeId"], where: { ...where, status: "VALID" }, _count: true, _sum: { fee: true } }),
    db.issuedDocument.count({ where: { ...where, status: "VOIDED" } }),
    db.issuedDocument.aggregate({ where: { ...where, status: "VALID" }, _sum: { fee: true } }),
    db.documentRequest.groupBy({ by: ["status"], where: { barangayCode: code, requestedAt: { gte: from, lt: to } }, _count: true }),
  ]);
  const rows = types.map((t) => {
    const g = byType.find((b) => b.documentTypeId === t.id);
    return { label: t.name, value: g?._count ?? 0, fees: Number(g?._sum.fee ?? 0) };
  });
  return {
    issued: rows.reduce((s, r) => s + r.value, 0),
    voided,
    fees: Number(fees._sum.fee ?? 0),
    byType: rows,
    requests: requests.map((r) => ({ label: r.status, value: r._count })),
  };
}

export async function blotterStatistics(code: string, from: Date, to: Date, includeVawc: boolean) {
  const where = { barangayCode: code, deletedAt: null, incidentAt: { gte: from, lt: to }, ...(includeVawc ? {} : { isVawc: false }) };
  const [total, byCategory, byStatus, byKind, kp, settled] = await Promise.all([
    db.blotterEntry.count({ where }),
    db.blotterEntry.groupBy({ by: ["category"], where, _count: true }),
    db.blotterEntry.groupBy({ by: ["status"], where, _count: true }),
    db.blotterEntry.groupBy({ by: ["kind"], where, _count: true }),
    db.blotterEntry.count({ where: { ...where, kpStage: { not: null } } }),
    db.blotterEntry.count({ where: { ...where, status: { in: ["SETTLED", "CLOSED"] } } }),
  ]);
  return {
    total,
    kpCases: kp,
    settled,
    byCategory: toData(byCategory.map((c) => ({ key: c.category, count: c._count }))),
    byStatus: toData(byStatus.map((c) => ({ key: c.status, count: c._count })), BLOTTER_STATUS),
    byKind: byKind.map((k) => ({ label: k.kind === "COMPLAINT" ? "Complaints" : "Incidents", value: k._count })),
  };
}

export async function resourceStatistics(code: string) {
  const where = { barangayCode: code, deletedAt: null };
  const [byCategory, byCondition, animals, vaccinated, total] = await Promise.all([
    db.communityResource.groupBy({ by: ["category"], where, _count: true, _sum: { quantity: true } }),
    db.communityResource.groupBy({ by: ["condition"], where, _count: true }),
    db.animal.groupBy({ by: ["species"], where: { ...where, status: "ACTIVE" }, _count: true }),
    db.animal.count({ where: { ...where, status: "ACTIVE", lastVaccinatedAt: { gte: new Date(Date.now() - 365 * 86400_000) } } }),
    db.communityResource.count({ where }),
  ]);
  const animalTotal = animals.reduce((s, a) => s + a._count, 0);
  return {
    total,
    byCategory: toData(byCategory.map((c) => ({ key: c.category, count: c._count })), RESOURCE_CATEGORY),
    byCondition: toData(byCondition.map((c) => ({ key: c.condition, count: c._count })), CONDITION, Object.values(CONDITION)),
    animals: toData(animals.map((a) => ({ key: a.species, count: a._count })), SPECIES),
    animalTotal,
    vaccinated,
  };
}
