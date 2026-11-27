import "server-only";

export type SearchParams = Record<string, string | string[] | undefined>;

export const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function pageOf(v: string | string[] | undefined) {
  const n = Number(str(v));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Keep only plain string params (for pagination links). */
export const flat = (p: SearchParams) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, str(v)]));

/** Words of a search box, each of which must match somewhere. */
export const words = (q?: string) => (q ? q.split(/\s+/).filter(Boolean).slice(0, 5) : []);

/** Accept a value only if it is one of the allowed keys (filters from the URL are untrusted). */
export const oneOf = <T extends string>(v: string | undefined, allowed: readonly T[] | Record<T, unknown>): T | undefined => {
  const list = (Array.isArray(allowed) ? allowed : Object.keys(allowed)) as T[];
  return v && list.includes(v as T) ? (v as T) : undefined;
};

export const PAGE_SIZE = 15;
