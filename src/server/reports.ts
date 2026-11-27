import "server-only";
import { db } from "@/server/db";
import { REPORT_KIND, REQUEST_STATUS, label } from "@/lib/labels";
import { blotterStatistics, certificateStatistics, householdStatistics, resourceStatistics, residentDemographics } from "@/server/queries/stats";
import { monthStart } from "@/server/time";
import type { ReportData, ReportKindKey } from "@/types/reports";

/** Report kinds that cover a period of time (the others are a snapshot of "now"). */
export const PERIODIC: ReportKindKey[] = ["CERTIFICATES", "BLOTTER"];

export const PERIODS = {
  "this-month": "This month",
  "last-month": "Last month",
  "this-quarter": "This quarter",
  "last-quarter": "Last quarter",
  "this-year": "This year",
  "last-12": "Last 12 months",
} as const;
export type PeriodKey = keyof typeof PERIODS;

const OFFSET = 8 * 3600_000;
const fmt = (d: Date) => new Date(d.getTime() - 1).toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" });

/** Resolves a period name, or explicit from/to dates (YYYY-MM-DD), to a [from, to) range in Philippine time. */
export function resolvePeriod(key?: string, fromStr?: string, toStr?: string) {
  if (fromStr && toStr && /^\d{4}-\d{2}-\d{2}$/.test(fromStr) && /^\d{4}-\d{2}-\d{2}$/.test(toStr)) {
    const from = new Date(`${fromStr}T00:00:00+08:00`);
    const to = new Date(new Date(`${toStr}T00:00:00+08:00`).getTime() + 86400_000);
    if (to > from) return { key: "custom", from, to, label: `${fmt(new Date(from.getTime() + 1))} to ${fmt(to)}` };
  }
  const k = (key && key in PERIODS ? key : "this-month") as PeriodKey;
  const local = new Date(Date.now() + OFFSET);
  const y = local.getUTCFullYear();
  const q = Math.floor(local.getUTCMonth() / 3);
  const at = (yy: number, mm: number) => new Date(Date.UTC(yy, mm, 1) - OFFSET);
  const ranges: Record<PeriodKey, [Date, Date]> = {
    "this-month": [monthStart(0), monthStart(1)],
    "last-month": [monthStart(-1), monthStart(0)],
    "this-quarter": [at(y, q * 3), at(y, q * 3 + 3)],
    "last-quarter": [at(y, q * 3 - 3), at(y, q * 3)],
    "this-year": [at(y, 0), at(y + 1, 0)],
    "last-12": [monthStart(-11), monthStart(1)],
  };
  const [from, to] = ranges[k];
  return { key: k, from, to, label: `${PERIODS[k]} (${fmt(new Date(from.getTime() + 1))} to ${fmt(to)})` };
}

type Period = { from: Date; to: Date; label: string };

/**
 * Builds a report for ONE barangay. VAWC cases are never included: they are counted only on the VAWC page.
 * The result is plain JSON, so it can be shown, printed, exported to CSV, or saved with a submission.
 */
export async function buildReport(kind: ReportKindKey, code: string, period: Period): Promise<ReportData> {
  const b = await db.barangay.findUniqueOrThrow({ where: { code }, include: { municipality: { include: { province: true } } } });
  const base = {
    kind,
    title: label(REPORT_KIND, kind),
    barangay: `Barangay ${b.name}, ${b.municipality.name}${b.municipality.province ? `, ${b.municipality.province.name}` : ""}`,
    generatedAt: new Date().toISOString(),
    period: PERIODIC.includes(kind) ? { from: period.from.toISOString(), to: period.to.toISOString(), label: period.label } : null,
  };

  switch (kind) {
    case "DEMOGRAPHICS": {
      const d = await residentDemographics(code);
      const male = d.sex.find((s) => s.label === "Male")?.value ?? 0;
      return {
        ...base,
        highlights: [
          { label: "Population", value: d.total },
          { label: "Male", value: male },
          { label: "Female", value: d.total - male },
          { label: "Registered voters", value: d.voters },
          { label: "Senior citizens", value: d.seniors },
        ],
        sections: [
          { title: "Sex", chart: "donut", rows: d.sex },
          { title: "Age group", chart: "bar", rows: d.ageGroups },
          { title: "Sector classification", chart: "bar", rows: d.classification, note: "A resident can belong to more than one sector." },
          { title: "Civil status", chart: "bar", rows: d.civilStatus },
          { title: "Highest education", chart: "bar", rows: d.education },
          { title: "Population by purok", chart: "bar", rows: d.byPurok },
        ],
      };
    }
    case "HOUSEHOLDS": {
      const h = await householdStatistics(code);
      return {
        ...base,
        highlights: [
          { label: "Households", value: h.total },
          { label: "Average size", value: Math.round(h.averageSize * 10) / 10 },
          { label: "With electricity", value: h.withElectricity },
          { label: "Piped water (Level II and III)", value: h.water.filter((w) => w.label === "Level III" || w.label === "Level II").reduce((s, w) => s + w.value, 0) },
        ],
        sections: [
          { title: "Household size", chart: "donut", rows: h.sizes },
          { title: "Water source", chart: "bar", rows: h.water },
          { title: "Tenure", chart: "bar", rows: h.tenure },
          { title: "Toilet facility", chart: "bar", rows: h.toilet },
          { title: "Households by purok", chart: "bar", rows: h.byPurok },
        ],
      };
    }
    case "CERTIFICATES": {
      const c = await certificateStatistics(code, period.from, period.to);
      return {
        ...base,
        highlights: [
          { label: "Documents issued", value: c.issued },
          { label: "Fees collected (₱)", value: c.fees },
          { label: "Voided", value: c.voided },
        ],
        sections: [
          { title: "Issued by document", chart: "bar", rows: c.byType.map((t) => ({ label: t.label, value: t.value })) },
          { title: "Fees by document (₱)", chart: "bar", rows: c.byType.filter((t) => t.fees > 0).map((t) => ({ label: t.label, value: t.fees })) },
          { title: "Requests received, by current status", chart: "bar", rows: c.requests.map((r) => ({ label: label(REQUEST_STATUS, r.label), value: r.value })) },
        ],
      };
    }
    case "BLOTTER": {
      const s = await blotterStatistics(code, period.from, period.to, false);
      return {
        ...base,
        highlights: [
          { label: "Entries recorded", value: s.total },
          { label: "Katarungang Pambarangay cases", value: s.kpCases },
          { label: "Settled or closed", value: s.settled },
        ],
        sections: [
          { title: "Incidents and complaints", chart: "donut", rows: s.byKind },
          { title: "By category", chart: "bar", rows: s.byCategory },
          { title: "By status", chart: "bar", rows: s.byStatus },
        ],
        note: "VAWC cases are excluded from this report, as required by RA 9262.",
      };
    }
    case "COMMUNITY_RESOURCES": {
      const r = await resourceStatistics(code);
      return {
        ...base,
        highlights: [
          { label: "Resources on record", value: r.total },
          { label: "Animals registered", value: r.animalTotal },
          { label: "Vaccinated in the last 12 months", value: r.vaccinated },
        ],
        sections: [
          { title: "Resources by category", chart: "bar", rows: r.byCategory },
          { title: "Resource condition", chart: "donut", rows: r.byCondition },
          { title: "Animals by species", chart: "bar", rows: r.animals },
        ],
      };
    }
    case "BARANGAY_PROFILE": {
      const [d, h, officials, puroks] = await Promise.all([
        residentDemographics(code),
        householdStatistics(code),
        db.barangayOfficial.findMany({ where: { barangayCode: code, isActive: true }, orderBy: { sortOrder: "asc" } }),
        db.purok.count({ where: { barangayCode: code } }),
      ]);
      return {
        ...base,
        highlights: [
          { label: "Population", value: d.total },
          { label: "Households", value: h.total },
          { label: "Puroks", value: puroks },
          { label: "Land area (ha)", value: b.landAreaHectares ? Number(b.landAreaHectares) : 0 },
        ],
        sections: [
          { title: "Officials", rows: officials.map((o) => ({ label: `${o.position}${o.committee ? ` (${o.committee})` : ""}`, value: 0, text: o.name })) },
          { title: "Population by purok", chart: "bar", rows: d.byPurok },
          { title: "Sex", chart: "donut", rows: d.sex },
          { title: "Age group", chart: "bar", rows: d.ageGroups },
        ],
      };
    }
    default:
      return { ...base, highlights: [], sections: [], note: "This report has no generated figures. Add your notes when submitting." };
  }
}

/** Report → CSV text (one row per figure). */
export function reportCsv(r: ReportData) {
  const lines = [["Report", r.title], ["Barangay", r.barangay], ["Period", r.period?.label ?? "As of generation"], ["Generated", r.generatedAt], []];
  lines.push(["Section", "Item", "Value"]);
  for (const h of r.highlights) lines.push(["Summary", h.label, String(h.value)]);
  for (const s of r.sections) for (const row of s.rows) lines.push([s.title, row.label, row.text ?? String(row.value)]);
  return lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
}

export const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralize spreadsheet formulas, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Kinds that make sense added up across barangays. */
export const CONSOLIDATED_KINDS: ReportKindKey[] = ["DEMOGRAPHICS", "HOUSEHOLDS", "CERTIFICATES", "BLOTTER", "COMMUNITY_RESOURCES"];

/**
 * One report for several barangays: every figure is added up by label. Averages are recomputed,
 * not summed. Also returns each barangay's headline numbers for a comparison table.
 */
export async function buildConsolidated(kind: ReportKindKey, barangays: { code: string; name: string }[], period: Period, title: string) {
  const reports = await Promise.all(barangays.map((b) => buildReport(kind, b.code, period)));
  const sum = (rows: { label: string; value: number }[][]) => {
    const order: string[] = [];
    const totals = new Map<string, number>();
    for (const list of rows)
      for (const r of list) {
        if (!totals.has(r.label)) order.push(r.label);
        totals.set(r.label, (totals.get(r.label) ?? 0) + r.value);
      }
    return order.map((label) => ({ label, value: Math.round((totals.get(label) ?? 0) * 100) / 100 }));
  };
  const first = reports[0];
  const highlights = sum(reports.map((r) => r.highlights.filter((h) => h.label !== "Average size")));
  if (kind === "HOUSEHOLDS") {
    const members = reports.reduce((s, r) => s + (r.highlights.find((h) => h.label === "Average size")?.value ?? 0) * (r.highlights.find((h) => h.label === "Households")?.value ?? 0), 0);
    const households = highlights.find((h) => h.label === "Households")?.value ?? 0;
    highlights.splice(1, 0, { label: "Average size", value: households ? Math.round((members / households) * 10) / 10 : 0 });
  }
  const report: ReportData = {
    kind,
    title: label(REPORT_KIND, kind),
    barangay: title,
    generatedAt: new Date().toISOString(),
    period: first?.period ?? null,
    highlights,
    sections: (first?.sections ?? [])
      .filter((s) => !s.rows.some((r) => r.text) && !/by purok/i.test(s.title))
      .map((s) => ({ ...s, rows: sum(reports.map((r) => r.sections.find((x) => x.title === s.title)?.rows ?? [])) })),
    note: `Combined figures of ${barangays.length} active barangay${barangays.length === 1 ? "" : "s"}.${first?.note ? ` ${first.note}` : ""}`,
  };
  const byBarangay = barangays.map((b, i) => ({ name: b.name, code: b.code, values: reports[i].highlights }));
  return { report, byBarangay };
}
