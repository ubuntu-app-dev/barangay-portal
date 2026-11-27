"use server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth/staff";
import { DEFAULT_OFFICES } from "@/lib/defaults";
import { audit } from "@/server/audit";
import { db } from "@/server/db";
import { fail, int, ok, opt, parse, req } from "@/server/forms";
import { getGeoProvider } from "@/lib/geo";
import { refreshDashboard } from "./shared";

const code10 = (c: string) => c.padStart(10, "0");
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Loads a city or municipality and all its barangays from the official PSGC source into the database,
 * creates the default offices, and activates it. Safe to run again: it only adds what is missing
 * and refreshes names.
 */
export async function importMunicipality(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("SUPERADMIN");
  const p = parse(z.object({ region: req("Region", 10), province: opt(10), municipality: req("City or municipality", 10) }), fd);
  if (!p.ok) return p.state;
  const geo = getGeoProvider();
  let region, province, municipality, barangays;
  try {
    const regions = await geo.regions();
    region = regions.find((r) => r.code === p.data.region);
    const provinces = region ? await geo.provinces(region.code) : [];
    province = p.data.province ? provinces.find((x) => x.code === p.data.province) : undefined;
    const muns = region ? await geo.municipalities({ region: region.code, province: province?.code }) : [];
    municipality = muns.find((m) => m.code === p.data.municipality);
    barangays = municipality ? await geo.barangays(municipality.code) : [];
  } catch {
    return fail("The PSGC service could not be reached. Try again in a few minutes.");
  }
  if (!region || !municipality) return fail("Choose the location again from the lists.");
  if (barangays.length === 0) return fail("The PSGC list has no barangays for this place.");

  // A province-free city is listed as its own "province": it then has no province above it.
  const realProvince = province && province.code !== municipality.code ? province : null;
  const isCity = /city/i.test(municipality.name);
  const mCode = code10(municipality.code);

  const result = await db.$transaction(
    async (tx: Prisma.TransactionClient) => {
      await tx.region.upsert({ where: { code: code10(region.code) }, create: { code: code10(region.code), name: clean(region.name) }, update: { name: clean(region.name) } });
      if (realProvince)
        await tx.province.upsert({ where: { code: code10(realProvince.code) }, create: { code: code10(realProvince.code), name: clean(realProvince.name), regionCode: code10(region.code) }, update: { name: clean(realProvince.name) } });
      const existed = await tx.municipality.findUnique({ where: { code: mCode } });
      await tx.municipality.upsert({
        where: { code: mCode },
        create: { code: mCode, name: clean(municipality.name), isCity, regionCode: code10(region.code), provinceCode: realProvince ? code10(realProvince.code) : null, isActive: true },
        update: { name: clean(municipality.name), isActive: true },
      });
      const before = await tx.barangay.count({ where: { municipalityCode: mCode } });
      for (const b of barangays)
        await tx.barangay.upsert({ where: { code: code10(b.code) }, create: { code: code10(b.code), name: clean(b.name), municipalityCode: mCode }, update: { name: clean(b.name) } });
      const added = (await tx.barangay.count({ where: { municipalityCode: mCode } })) - before;
      const offices = await tx.municipalOffice.count({ where: { municipalityCode: mCode } });
      if (!offices) await tx.municipalOffice.createMany({ data: DEFAULT_OFFICES.map((o) => ({ ...o, municipalityCode: mCode })) });
      await audit(u.actor, { action: existed ? "UPDATE" : "CREATE", entityType: "Municipality", entityId: mCode, summary: `${existed ? "Refreshed" : "Onboarded"} ${clean(municipality.name)} with ${barangays.length} barangays from the PSGC list` }, tx);
      return { added, existed: !!existed };
    },
    { timeout: 60_000 },
  );
  refreshDashboard();
  return ok(`${clean(municipality.name)} is ready: ${barangays.length} barangays${result.existed ? ` (${result.added} new)` : ""}. Next, create its IT administrator.`);
}

export async function setMunicipalityActive(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("SUPERADMIN");
  const code = String(fd.get("code") ?? "");
  const active = fd.get("active") === "true";
  const reason = String(fd.get("reason") ?? "").trim();
  if (!active && reason.length < 5) return fail("Give the reason.", { reason: "Give a reason." });
  const m = await db.municipality.findUnique({ where: { code } });
  if (!m) return fail("Unknown municipality.");
  await db.$transaction(async (tx) => {
    await tx.municipality.update({ where: { code }, data: { isActive: active } });
    if (!active) await tx.session.deleteMany({ where: { user: { OR: [{ municipalityCode: code }, { barangay: { municipalityCode: code } }] } } });
    await audit(u.actor, { action: "UPDATE", entityType: "Municipality", entityId: code, summary: `${active ? "Reactivated" : "Deactivated"} ${m.name}${reason ? `: ${reason}` : ""}` }, tx);
  });
  refreshDashboard();
  return ok(active ? `${m.name} is active again.` : `${m.name} was deactivated. Its users were signed out.`);
}

export async function saveSystemSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  const u = await requireRole("SUPERADMIN");
  const p = parse(z.object({ sessionHours: int("Session length", 1, 72), passwordMinLength: int("Minimum password length", 8, 32), maintenanceBanner: opt(300) }), fd);
  if (!p.ok) return p.state;
  const v = p.data;
  const set = (key: string, value: Prisma.InputJsonValue) => db.systemSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  await db.$transaction([set("session.hours", v.sessionHours), set("password.minLength", v.passwordMinLength), set("maintenance.banner", v.maintenanceBanner ?? "")]);
  await audit(u.actor, { action: "UPDATE", entityType: "SystemSetting", summary: `Changed system settings (session ${v.sessionHours} h, passwords ${v.passwordMinLength}+ characters${v.maintenanceBanner ? ", banner on" : ", banner off"})` });
  refreshDashboard();
  return ok("Settings saved. New sign-ins and password changes use them right away.");
}
