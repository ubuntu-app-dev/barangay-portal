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
