import type { GeoOption, GeoProvider } from "@/types/geo";

/**
 * Free PSGC API (Philippine Standard Geographic Code, the PSA's coding system).
 * Called from the server only; the browser talks to /api/geo. Responses are cached for a day.
 */
const BASE = "https://psgc.gitlab.io/api";
const REVALIDATE_SECONDS = 60 * 60 * 24;

type Raw = { code?: string | number; psgc10DigitCode?: string | number; name?: string; regionName?: string };

async function load(path: string): Promise<Raw[]> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`PSGC request failed: ${res.status}`);
  return (await res.json()) as Raw[];
}

function toOptions(raw: Raw[], label: (r: Raw) => string, sortBy: "code" | "name"): GeoOption[] {
  const seen = new Set<string>();
  const options: GeoOption[] = [];
  for (const r of raw) {
    const code = String(r.code ?? r.psgc10DigitCode ?? "");
    const name = label(r).trim();
    if (!code || !name || seen.has(code)) continue;
    seen.add(code);
    options.push({ code, name });
  }
  return options.sort((a, b) => (sortBy === "code" ? a.code.localeCompare(b.code) : a.name.localeCompare(b.name, "en")));
}

const plain = (r: Raw) => r.name ?? "";
const regionLabel = (r: Raw) => (r.regionName && r.name && r.regionName !== r.name ? `${r.regionName} (${r.name})` : (r.name ?? ""));

export const psgcProvider: GeoProvider = {
  regions: async () => toOptions(await load("/regions/"), regionLabel, "code"),
  provinces: async (region) => toOptions(await load(`/regions/${region}/provinces/`), plain, "name"),
  // Regions without provinces (such as NCR) list their cities and municipalities directly.
  municipalities: async ({ region, province }) =>
    toOptions(
      await load(province ? `/provinces/${province}/cities-municipalities/` : `/regions/${region}/cities-municipalities/`),
      plain,
      "name",
    ),
  barangays: async (municipality) => toOptions(await load(`/cities-municipalities/${municipality}/barangays/`), plain, "name"),
};
