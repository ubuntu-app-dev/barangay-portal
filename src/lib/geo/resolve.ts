import { cacheLife } from "next/cache";
import { getGeoProvider } from "@/lib/geo";
import { slugsFor } from "@/lib/slug";
import type { GeoOption, ResolvedLocation } from "@/types/geo";

const bySlug = (options: GeoOption[], slug: string) => {
  const slugs = slugsFor(options);
  return options.find((o) => slugs.get(o.code) === slug) ?? null;
};

/**
 * Turns /province/municipality/barangay (or /province/municipality) back into location codes.
 * The first segment is a province slug, or a region slug for NCR and province-free cities.
 * Returns null when any segment doesn't match. Cached for days: the data changes a few times a year.
 */
export async function resolveLocation(
  areaSlug: string,
  municipalitySlug: string,
  barangaySlug?: string,
): Promise<ResolvedLocation | null> {
  "use cache";
  cacheLife("days");

  const provider = getGeoProvider();
  const regions = await provider.regions();

  let region = bySlug(regions, areaSlug);
  let province: GeoOption | null = null;
  if (!region) {
    const perRegion = await Promise.all(
      regions.map(async (r) => ({
        r,
        provinces: await provider.provinces(r.code),
      })),
    );
    for (const { r, provinces } of perRegion) {
      const hit = bySlug(provinces, areaSlug);
      if (hit) {
        region = r;
        province = hit;
        break;
      }
    }
  }
  if (!region) return null;

  const municipality = bySlug(
    await provider.municipalities({
      region: region.code,
      province: province?.code,
    }),
    municipalitySlug,
  );
  if (!municipality) return null;
  if (barangaySlug === undefined)
    return { region, province, municipality, barangay: null };

  const barangay = bySlug(
    await provider.barangays(municipality.code),
    barangaySlug,
  );
  return barangay ? { region, province, municipality, barangay } : null;
}
