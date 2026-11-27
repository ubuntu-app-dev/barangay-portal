import "server-only";
import { cache } from "react";
import { db } from "./db";

export type SystemSettings = { sessionHours: number; passwordMinLength: number; maintenanceBanner: string };

export const SETTING_DEFAULTS: SystemSettings = { sessionHours: 12, passwordMinLength: 8, maintenanceBanner: "" };

const num = (v: unknown, min: number, max: number, fallback: number) => (typeof v === "number" && v >= min && v <= max ? v : fallback);

/** Superadmin settings, read once per request. Missing or invalid values fall back to safe defaults. */
export const getSettings = cache(async (): Promise<SystemSettings> => {
  const rows = await db.systemSetting.findMany();
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  return {
    sessionHours: num(get("session.hours"), 1, 72, SETTING_DEFAULTS.sessionHours),
    passwordMinLength: num(get("password.minLength"), 8, 32, SETTING_DEFAULTS.passwordMinLength),
    maintenanceBanner: typeof get("maintenance.banner") === "string" ? (get("maintenance.banner") as string).slice(0, 300) : "",
  };
});
