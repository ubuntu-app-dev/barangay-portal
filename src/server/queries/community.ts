import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ANIMAL_STATUS, CONDITION, RESOURCE_CATEGORY, SPECIES, WATER_SHORT } from "@/lib/labels";
import { db } from "@/server/db";
import { oneOf, PAGE_SIZE, pageOf, str, words, type SearchParams } from "@/server/params";
import type { Session } from "@/types/dashboard";

export async function listAnimals(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const species = oneOf(str(sp.species), SPECIES);
  const status = oneOf(str(sp.status), ANIMAL_STATUS);
  const vax = str(sp.vax);
  const yearAgo = new Date(Date.now() - 365 * 86400_000);
  const where: Prisma.AnimalWhereInput = {
    barangayCode: session.barangay.code,
    deletedAt: null,
    status: status ?? "ACTIVE",
    ...(species ? { species } : {}),
    ...(vax === "due" ? { OR: [{ lastVaccinatedAt: null }, { lastVaccinatedAt: { lt: yearAgo } }] } : vax === "ok" ? { lastVaccinatedAt: { gte: yearAgo } } : {}),
    AND: words(str(sp.q)).map((t) => ({
      OR: [
        { tagNo: { contains: t, mode: "insensitive" } },
        { name: { contains: t, mode: "insensitive" } },
        { ownerName: { contains: t, mode: "insensitive" } },
        { breed: { contains: t, mode: "insensitive" } },
      ],
    })),
  };
  const [rows, total, bySpecies, due] = await Promise.all([
    db.animal.findMany({ where, include: { owner: { select: { id: true, residentNo: true } } }, orderBy: { tagNo: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.animal.count({ where }),
    db.animal.groupBy({ by: ["species"], where: { barangayCode: session.barangay.code, deletedAt: null, status: "ACTIVE" }, _count: true }),
    db.animal.count({ where: { barangayCode: session.barangay.code, deletedAt: null, status: "ACTIVE", species: { in: ["DOG", "CAT"] }, OR: [{ lastVaccinatedAt: null }, { lastVaccinatedAt: { lt: yearAgo } }] } }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE, bySpecies, due };
}

export async function waterOverview(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const water = oneOf(str(sp.water), WATER_SHORT);
  const purok = str(sp.purok);
  const code = session.barangay.code;
  const where: Prisma.HouseholdWhereInput = {
    barangayCode: code,
    deletedAt: null,
    ...(water ? { waterSource: water } : {}),
    ...(purok ? { purokId: purok } : {}),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ householdNo: { contains: t, mode: "insensitive" } }, { address: { contains: t, mode: "insensitive" } }] })),
  };
  const [groups, byPurok, rows, total, puroks, systems] = await Promise.all([
    db.household.groupBy({ by: ["waterSource"], where: { barangayCode: code, deletedAt: null }, _count: true }),
    db.household.groupBy({ by: ["purokId", "waterSource"], where: { barangayCode: code, deletedAt: null }, _count: true }),
    db.household.findMany({ where, include: { purok: true, members: { where: { relationship: "HEAD", deletedAt: null }, take: 1 }, _count: { select: { members: { where: { deletedAt: null, status: "ACTIVE" } } } } }, orderBy: { householdNo: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.household.count({ where }),
    db.purok.findMany({ where: { barangayCode: code }, orderBy: { sortOrder: "asc" } }),
    db.communityResource.findMany({ where: { barangayCode: code, deletedAt: null, category: "WATER_SYSTEM" }, orderBy: { name: "asc" } }),
  ]);
  return { groups, byPurok, rows, total, page, pageSize: PAGE_SIZE, puroks, systems };
}

export async function listResources(session: Session, sp: SearchParams) {
  const page = pageOf(sp.page);
  const category = oneOf(str(sp.category), RESOURCE_CATEGORY);
  const condition = oneOf(str(sp.condition), CONDITION);
  const where: Prisma.CommunityResourceWhereInput = {
    barangayCode: session.barangay.code,
    deletedAt: null,
    ...(category ? { category } : {}),
    ...(condition ? { condition } : {}),
    AND: words(str(sp.q)).map((t) => ({ OR: [{ name: { contains: t, mode: "insensitive" } }, { location: { contains: t, mode: "insensitive" } }, { custodian: { contains: t, mode: "insensitive" } }] })),
  };
  const [rows, total, byCategory, byCondition, value] = await Promise.all([
    db.communityResource.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.communityResource.count({ where }),
    db.communityResource.groupBy({ by: ["category"], where: { barangayCode: session.barangay.code, deletedAt: null }, _count: true }),
    db.communityResource.groupBy({ by: ["condition"], where: { barangayCode: session.barangay.code, deletedAt: null }, _count: true }),
    db.communityResource.aggregate({ where: { barangayCode: session.barangay.code, deletedAt: null }, _sum: { value: true } }),
  ]);
  return { rows, total, page, pageSize: PAGE_SIZE, byCategory, byCondition, totalValue: Number(value._sum.value ?? 0) };
}
