import "server-only";

/**
 * In-memory sliding window per key (one server process). Good enough for a single municipal server;
 * behind several instances, move this to Redis or the reverse proxy.
 */
const hits = new Map<string, number[]>();

export function tooMany(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.set(key, recent);
  if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length >= limit;
}

export function hit(key: string) {
  const list = hits.get(key) ?? [];
  list.push(Date.now());
  hits.set(key, list);
}
