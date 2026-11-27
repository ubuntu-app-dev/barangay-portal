export type ReportKindKey = "DEMOGRAPHICS" | "HOUSEHOLDS" | "CERTIFICATES" | "BLOTTER" | "COMMUNITY_RESOURCES" | "BARANGAY_PROFILE" | "OTHER";

export type ReportRow = { label: string; value: number; text?: string };

/** A generated report. Plain JSON: shown on screen, printed, exported, and saved with municipal submissions. */
export type ReportData = {
  kind: ReportKindKey;
  title: string;
  barangay: string;
  generatedAt: string;
  period: { from: string; to: string; label: string } | null;
  highlights: { label: string; value: number }[];
  sections: { title: string; chart?: "bar" | "donut"; rows: ReportRow[]; note?: string }[];
  note?: string;
};
