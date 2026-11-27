const ZONE = "Asia/Manila";

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-PH").format(n);
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: ZONE,
  }).format(new Date(iso));
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ZONE,
  }).format(new Date(iso));
export const formatPercent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "0%";
export const formatMonthDay = (iso: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    timeZone: ZONE,
  }).format(new Date(iso));

const ordinal = (n: number) => {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10]}`;
};
/** "15th", "November", "2026" for a timestamp, in Philippine time. */
export function longDateParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONE,
  }).formatToParts(new Date(timestamp));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: ordinal(Number(get("day"))),
    month: get("month"),
    year: get("year"),
  };
}
export const formatPeso = (n: number) =>
  n === 0 ? "No fee" : `\u20B1${new Intl.NumberFormat("en-PH").format(n)}`;

type Named = { firstName: string; middleName?: string | null; lastName: string; suffix?: string | null };
/** "Dela Cruz, Juan S. Jr." */
export const nameLastFirst = (r: Named) =>
  `${r.lastName}, ${r.firstName}${r.middleName ? ` ${r.middleName[0]}.` : ""}${r.suffix ? ` ${r.suffix}` : ""}`;
/** "Juan S. Dela Cruz Jr." */
export const nameFull = (r: Named) =>
  [r.firstName, r.middleName ? `${r.middleName[0]}.` : null, r.lastName, r.suffix].filter(Boolean).join(" ");
/** Whole years between a birth date and now (or a given time). */
export function ageOf(birth: Date | string, at: Date = new Date()) {
  const b = new Date(birth);
  let age = at.getUTCFullYear() - b.getUTCFullYear();
  const m = at.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && at.getUTCDate() < b.getUTCDate())) age--;
  return age;
}
export const formatMoney = (n: number | string | { toString(): string }) =>
  `₱${new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n.toString()))}`;
export const isoDay = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

/** Whole days from now until a date (negative when past). Kept out of component bodies so renders stay pure. */
export const daysUntil = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 86400_000);
/** The moment `days` days ago. */
export const daysAgoDate = (days: number) => new Date(Date.now() - days * 86400_000);
/** Link to a CSV export. */
export const exportHref = (kind: string, query?: Record<string, string | undefined>) => {
  const q = new URLSearchParams(Object.entries(query ?? {}).filter((e): e is [string, string] => !!e[1]));
  return `/api/dashboard/export/${kind}${q.size ? `?${q}` : ""}`;
};
