import "server-only";

/** Philippine time has no daylight saving: a fixed +08:00 offset. */
const OFFSET = 8 * 3600_000;

/** First instant of a month in Philippine time. offset 0 = this month, -1 = last month. */
export function monthStart(offset = 0, now = new Date()) {
  const local = new Date(now.getTime() + OFFSET);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + offset, 1) - OFFSET);
}

export function dayStart(offset = 0, now = new Date()) {
  const local = new Date(now.getTime() + OFFSET);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + offset) - OFFSET);
}

/** Year in Philippine time. */
export const phYear = (d = new Date()) => new Date(d.getTime() + OFFSET).getUTCFullYear();

/** Birth date such that someone born on or before it is at least `years` old today. */
export function bornOnOrBefore(years: number, now = new Date()) {
  const d = dayStart(0, now);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d;
}

export function ageOn(birth: Date, now = new Date()) {
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

export function addMonths(d: Date, months: number) {
  const out = new Date(d);
  out.setUTCMonth(out.getUTCMonth() + months);
  return out;
}

/** "2026-11-27" for <input type="date">. */
export const isoDate = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

/** A date-only range (stored as UTC midnight) → [start, end) instants in Philippine time, end day included. */
export const phDayRange = (start: Date, end: Date) => ({ from: new Date(start.getTime() - OFFSET), to: new Date(end.getTime() + 86400_000 - OFFSET) });
