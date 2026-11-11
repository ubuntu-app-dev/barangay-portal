"use client";
import { useCallback, useEffect, useState } from "react";
import type { GeoOption, GeoStatus } from "@/types/geo";

const cache = new Map<string, GeoOption[]>();
const none: GeoOption[] = [];
type Outcome = { key: string; options?: GeoOption[] };

/** Loads one level of location options from /api/geo. Pass null to stay idle. */
export function useGeoOptions(query: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const key = `${query}#${attempt}`;
  const cached = query ? cache.get(query) : undefined;

  useEffect(() => {
    if (!query || cache.has(query)) return;
    const controller = new AbortController();
    fetch(`/api/geo?${query}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json() as Promise<GeoOption[]>;
      })
      .then((options) => {
        cache.set(query, options);
        setOutcome({ key, options });
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setOutcome({ key });
      });
    return () => controller.abort();
  }, [query, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let status: GeoStatus = "idle";
  let options = none;
  if (query) {
    if (cached) {
      status = "ready";
      options = cached;
    } else if (outcome?.key === key) status = outcome.options ? "ready" : "error";
    else status = "loading";
  }
  return { options, status, retry };
}
