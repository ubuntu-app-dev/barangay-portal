import type { GeoOption, GeoProvider } from "@/types/geo";

/**
 * Official PSA PSGC Classifications API (token required). Server only: the token never reaches the browser.
 * Responses are paginated ({ count, next, previous, results: [{ code, area_name, geographic_level, ... }] })
 * and flat, so we follow the pages and filter by PSGC code prefix. A 10-digit code reads RR PPP MM BBB
 * (region, province, municipality, barangay).
 */
const HOST = "classification.psa.gov.ph";
const BASE = `https://${HOST}/psgc`;
const REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_PAGES = 400;
const VERSION_FORMAT = /^Q[1-4]_\d{4}$/;
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "barangay-portal/1.0",
};

type Row = {
  code?: string | number;
  psgc_code?: string | number;
  area_name?: string;
  geographic_level?: string;
};
type Level = "regions" | "provinces" | "municipalities" | "barangays";
type Page = { rows: Row[]; count: number; next: string | null };

function settings() {
  const token = process.env.PSA_PSGC_TOKEN?.trim();
  const version = process.env.PSA_PSGC_VERSION?.trim() || "Q2_2024";
  if (!token) throw new Error("PSA_PSGC_TOKEN is not set");
  if (!VERSION_FORMAT.test(version))
    throw new Error("PSA_PSGC_VERSION must look like Q2_2024");
  return { token, version };
}

const isRow = (value: unknown): value is Row =>
  !!value &&
  typeof value === "object" &&
  "area_name" in value &&
  ("code" in value || "psgc_code" in value);

// Finds the list of records wherever it sits in the response.
function findRows(node: unknown): Row[] | null {
  if (Array.isArray(node)) {
    if (isRow(node[0])) return node as Row[];
    for (const item of node) {
      const found = findRows(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) {
      const found = findRows(value);
      if (found) return found;
    }
  }
  return null;
}

// Only ever follow links that stay on the PSA host.
function sameHost(raw: string | null): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.hostname !== HOST) return null;
    url.protocol = "https:";
    return url;
  } catch {
    return null;
  }
}

async function fetchPage(url: string, level: Level): Promise<Page> {
  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: REVALIDATE_SECONDS },
  });
  // Never put the URL in an error: it contains the token.
  if (!res.ok)
    throw new Error(
      `PSA PSGC ${level} request failed with status ${res.status}`,
    );
  const payload: unknown = await res.json();
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  return {
    rows: findRows(payload) ?? [],
    count: typeof body.count === "number" ? body.count : 0,
    next: typeof body.next === "string" ? body.next : null,
  };
}

async function load(
  level: Level,
  filters: Record<string, string> = {},
): Promise<Row[]> {
  const { token, version } = settings();
  const first = await fetchPage(
    `${BASE}/${version}/${level}?${new URLSearchParams({ token, page_size: "1000", ...filters })}`,
    level,
  );
  const rows = [...first.rows];
  const next = sameHost(first.next);
  if (!next) return rows;

  // Page-numbered results: fetch the remaining pages in parallel.
  if (
    next.searchParams.get("page") === "2" &&
    first.rows.length > 0 &&
    first.count > first.rows.length
  ) {
    const pages = Math.min(
      Math.ceil(first.count / first.rows.length),
      MAX_PAGES,
    );
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => {
        const url = new URL(next);
        url.searchParams.set("page", String(i + 2));
        return fetchPage(url.toString(), level);
      }),
    );
    return rows.concat(...rest.map((p) => p.rows));
  }

  // Any other pagination style: follow the links one at a time.
  let url: URL | null = next;
  for (let i = 0; url && i < MAX_PAGES; i++) {
    const page = await fetchPage(url.toString(), level);
    rows.push(...page.rows);
    url = sameHost(page.next);
  }
  return rows;
}

const codeOf = (r: Row) => {
  const raw = r.code ?? r.psgc_code;
  return raw ? String(raw).padStart(10, "0") : "";
};
// Rows without a level are kept; rows with another level (districts, sub-municipalities) are dropped.
const isLevel = (r: Row, ...names: string[]) =>
  !r.geographic_level || names.includes(r.geographic_level.toLowerCase());

function toOptions(
  rows: Row[],
  keep: (code: string, row: Row) => boolean,
  sortBy: "code" | "name",
): GeoOption[] {
  const seen = new Set<string>();
  const out: GeoOption[] = [];
  for (const r of rows) {
    const code = codeOf(r);
    const name = (r.area_name ?? "").trim();
    if (!code || !name || seen.has(code) || !keep(code, r)) continue;
    seen.add(code);
    out.push({ code, name });
  }
  return out.sort((a, b) =>
    sortBy === "code"
      ? a.code.localeCompare(b.code)
      : a.name.localeCompare(b.name, "en"),
  );
}

const lowerLevel = (r: Row) => (r.geographic_level ?? "").toLowerCase();
const isProvince = (r: Row) => ["prov", "province"].includes(lowerLevel(r));
const isPlace = (r: Row) =>
  ["city", "mun", "municipality"].includes(lowerLevel(r));
// Highly urbanized and independent cities sit at the province slot of the code (MM = 00) and have no province above them.
const isProvinceFreeCity = (code: string, r: Row) =>
  lowerLevel(r) === "city" && code.slice(5, 7) === "00";

/** Provinces and municipalities in one list (each is a single request of one or two pages). */
async function placeRows(): Promise<Row[]> {
  const [provinces, municipalities] = await Promise.all([
    load("provinces"),
    load("municipalities"),
  ]);
  return [...provinces, ...municipalities];
}

export const psaProvider: GeoProvider = {
  regions: async () => {
    const options = toOptions(await load("regions"), () => true, "code");
    if (options.length === 0)
      throw new Error(
        "PSA PSGC regions returned no rows. Check PSA_PSGC_VERSION and your token's access.",
      );
    return options;
  },

  // Real provinces, plus the province-free cities of the region (Davao City, Baguio City, ...).
  // A region with no real provinces (NCR) returns nothing, so the province step is skipped.
  provinces: async (region) => {
    const rows = await placeRows();
    const inRegion = (code: string) => code.startsWith(region.slice(0, 2));
    const real = toOptions(
      rows,
      (code, r) => inRegion(code) && isProvince(r),
      "name",
    );
    if (real.length === 0) return [];
    return toOptions(
      rows,
      (code, r) =>
        inRegion(code) && (isProvince(r) || isProvinceFreeCity(code, r)),
      "name",
    );
  },

  municipalities: async ({ region, province }) => {
    const rows = await placeRows();
    if (province) {
      // A province-free city is its own (only) city or municipality.
      const self = toOptions(
        rows,
        (code, r) => code === province && isProvinceFreeCity(code, r),
        "name",
      );
      if (self.length > 0) return self;
      return toOptions(
        rows,
        (code, r) =>
          code.startsWith(province.slice(0, 5)) &&
          isPlace(r) &&
          code.slice(5, 7) !== "00",
        "name",
      );
    }
    // No province (NCR): every city and municipality of the region.
    return toOptions(
      rows,
      (code, r) => code.startsWith(region.slice(0, 2)) && isPlace(r),
      "name",
    );
  },

  barangays: async (municipality) => {
    // Province-free cities (MM = 00) keep their barangays under the first 5 digits.
    const prefix =
      municipality.slice(5, 7) === "00"
        ? municipality.slice(0, 5)
        : municipality.slice(0, 7);
    const province = Number(municipality.slice(2, 5));
    // `prv` only narrows the download; the prefix check is what decides.
    const rows = await load(
      "barangays",
      province > 0 ? { prv: String(province) } : {},
    );
    return toOptions(rows, (code) => code.startsWith(prefix), "name");
  },
};
