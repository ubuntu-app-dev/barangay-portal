"use client";
import { useSyncExternalStore } from "react";

// The current time, read in the browser only (Next.js with Cache Components rejects `new Date()` during render).
let snapshot = 0;
function subscribe(notify: () => void) {
  snapshot = Date.now();
  notify();
  const id = setInterval(() => {
    snapshot = Date.now();
    notify();
  }, 60_000);
  return () => clearInterval(id);
}

/** Milliseconds since 1970, updated every minute. 0 on the server and before the first browser render. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => 0,
  );
}
