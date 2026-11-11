"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The current year, read on the client only. Next.js with Cache Components rejects `new Date()`
 * during prerender, so the server renders nothing here and the browser fills in the year.
 */
export default function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, () => String(new Date().getFullYear()), () => "");
  return <>{year}</>;
}
