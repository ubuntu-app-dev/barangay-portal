import type { GeoOption } from "@/types/geo";

/** "Las Piñas City" becomes "las-pinas-city". */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A URL slug for every option in one list. Names that would collide get the last three digits of
 * their PSGC code, so the same list always produces the same slugs (browser and server agree).
 */
export function slugsFor(options: GeoOption[]): Map<string, string> {
  const base = options.map((o) => [o.code, slugify(o.name) || o.code] as const);
  const counts = new Map<string, number>();
  for (const [, slug] of base) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return new Map(
    base.map(([code, slug]) => [
      code,
      (counts.get(slug) ?? 0) > 1 ? `${slug}-${code.slice(-3)}` : slug,
    ]),
  );
}
