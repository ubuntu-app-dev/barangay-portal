import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { RESIDENT_STATUS, SEX, WATER } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import { bornOnOrBefore } from "@/server/time";
import type { Session } from "@/types/dashboard";

export const CLASSES = {
  voter: { label: "Registered voters", where: { isRegisteredVoter: true } },
  senior: { label: "Senior citizens", where: null },
  pwd: { label: "Persons with disability", where: { isPwd: true } },
  solo: { label: "Solo parents", where: { isSoloParent: true } },
  "4ps": { label: "4Ps beneficiaries", where: { is4Ps: true } },
  osy: { label: "Out-of-school youth", where: { isOutOfSchoolYouth: true } },
  ofw: { label: "OFWs", where: { isOfw: true } },
  ip: { label: "Indigenous peoples", where: { isIndigenous: true } },
} as const;
export type ClassKey = keyof typeof CLASSES;

export function classWhere(key: ClassKey): Prisma.ResidentWhereInput {
  if (key === "senior") return { birthDate: { lte: bornOnOrBefore(60) } };
  return CLASSES[key].where as Prisma.ResidentWhereInput;
}

export function residentSearch(q?: string): Prisma.ResidentWhereInput[] {
  return words(q).map((t) => ({
    OR: [
      { firstName: { contains: t, mode: "insensitive" } },
      { lastName: { contains: t, mode: "insensitive" } },
      { middleName: { contains: t, mode: "insensitive" } },
      { residentNo: { contains: t, mode: "insensitive" } },
      { contactNumber: { contains: t } },
    ],
  }));
}

export async function getPuroks(session: Session) {
  return db.purok.findMany({ where: { barangayCode: session.barangay.code }, orderBy: { sortOrder: "asc" } });
}

export async function listResidents(session: Session, sp: SearchParams, limit?: number) {
  const page = limit ? 1 : pageOf(sp.page);
  const take = limit ?? PAGE_SIZE;
  const status = oneOf(str(sp.status), RESIDENT_STATUS);
  const sex = oneOf(str(sp.sex), SEX);
  const cls = oneOf(str(sp.class), CLASSES);
  const purok = str(sp.purok);
  const where: Prisma.ResidentWhereInput = {
    barangayCode: session.barangay.code,
    deletedAt: null,
    status: status ?? "ACTIVE",
    ...(sex ? { sex } : {}),
    ...(purok ? { purokId: purok } : {}),
    AND: [...residentSearch(str(sp.q)), ...(cls ? [classWhere(cls)] : [])],
  };
  const [rows, total] = await Promise.all([
    db.resident.findMany({
      where,
      include: { purok: true, household: { select: { id: true, householdNo: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * take,
      take,
    }),
    db.resident.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function getResident(session: Session, id: string) {
  const r = await db.resident.findFirst({
    where: { id, barangayCode: session.barangay.code, deletedAt: null },
    include: {
      purok: true,
      family: true,
      household: {
        include: {
          purok: true,
          members: { where: { deletedAt: null }, orderBy: { birthDate: "asc" }, select: { id: true, firstName: true, lastName: true, relationship: true, birthDate: true, status: true } },
        },
      },
      issued: { include: { documentType: true }, orderBy: { issuedAt: "desc" }, take: 10 },
      requests: { include: { documentType: true }, where: { status: { in: ["PENDING", "PROCESSING", "READY_FOR_RELEASE"] } }, orderBy: { requestedAt: "desc" } },
      blotterParties: {
        where: { entry: { deletedAt: null, ...(session.permissions.includes("vawc:view") ? {} : { isVawc: false }) } },
        include: { entry: true },
        take: 10,
      },
      animals: { where: { deletedAt: null } },
    },
  });
  if (!r) notFound();
  const history = await db.auditLog.findMany({
    where: { barangayCode: session.barangay.code, entityType: "Resident", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { ...r, history };
}

export async function listHouseholds(session: Session, sp: SearchParams, limit?: number) {
  const page = limit ? 1 : pageOf(sp.page);
  const take = limit ?? PAGE_SIZE;
  const water = oneOf(str(sp.water), WATER);
  const purok = str(sp.purok);
  const where: Prisma.HouseholdWhereInput = {
    barangayCode: session.barangay.code,
    deletedAt: null,
    ...(water ? { waterSource: water } : {}),
    ...(purok ? { purokId: purok } : {}),
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { householdNo: { contains: t, mode: "insensitive" } },
        { address: { contains: t, mode: "insensitive" } },
        { members: { some: { deletedAt: null, lastName: { contains: t, mode: "insensitive" } } } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    db.household.findMany({
      where,
      include: {
        purok: true,
        members: { where: { deletedAt: null, status: "ACTIVE" }, select: { id: true, firstName: true, lastName: true, relationship: true } },
        _count: { select: { families: true } },
      },
      orderBy: { householdNo: "asc" },
      skip: (page - 1) * take,
      take,
    }),
    db.household.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function getHousehold(session: Session, id: string) {
  const h = await db.household.findFirst({
    where: { id, barangayCode: session.barangay.code, deletedAt: null },
    include: {
      purok: true,
      members: { where: { deletedAt: null }, include: { family: true }, orderBy: [{ relationship: "asc" }, { birthDate: "asc" }] },
      families: { include: { _count: { select: { members: true } } }, orderBy: { createdAt: "asc" } },
      animals: { where: { deletedAt: null } },
    },
  });
  if (!h) notFound();
  const history = await db.auditLog.findMany({
    where: { barangayCode: session.barangay.code, entityType: "Household", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  return { ...h, history };
}

export async function listFamilies(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const where: Prisma.FamilyWhereInput = {
    barangayCode: session.barangay.code,
    household: { deletedAt: null },
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { name: { contains: t, mode: "insensitive" } },
        { household: { householdNo: { contains: t, mode: "insensitive" } } },
        { members: { some: { lastName: { contains: t, mode: "insensitive" } } } },
      ],
    })),
  };
  const [rows, total] = await Promise.all([
    db.family.findMany({
      where,
      include: {
        household: { include: { purok: true } },
        members: { where: { deletedAt: null, status: "ACTIVE" }, orderBy: { birthDate: "asc" }, select: { id: true, firstName: true, lastName: true, relationship: true, birthDate: true, sex: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.family.count({ where }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE };
}

export async function classificationCounts(session: Session) {
  const base = { barangayCode: session.barangay.code, deletedAt: null, status: "ACTIVE" as const };
  const entries = await Promise.all(
    (Object.keys(CLASSES) as ClassKey[]).map(async (k) => [k, await db.resident.count({ where: { ...base, ...classWhere(k) } })] as const),
  );
  return Object.fromEntries(entries) as Record<ClassKey, number>;
}
