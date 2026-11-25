"use client";
import { useSyncExternalStore } from "react";
import Icon from "@/components/dashboard/ui/Icon";

// The clock reads the time in the browser only (Next.js with Cache Components rejects reading it during render).
let snapshot = 0;
function subscribe(notify: () => void) {
  snapshot = Date.now();
  notify();
  const id = setInterval(() => {
    snapshot = Date.now();
    notify();
  }, 1000);
  return () => clearInterval(id);
}
const getSnapshot = () => snapshot;
const getServerSnapshot = () => 0;

const ZONE = "Asia/Manila";
const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "full", timeZone: ZONE });
const timeFormat = new Intl.DateTimeFormat("en-PH", { timeStyle: "medium", timeZone: ZONE });

export default function LiveClock() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-ink-secondary">
      <span className="inline-flex items-center gap-2"><Icon name="calendar" className="h-4 w-4" />{now ? dateFormat.format(now) : "Loading date"}</span>
      <span className="inline-flex items-center gap-2 tabular-nums"><Icon name="clock" className="h-4 w-4" />{now ? timeFormat.format(now) : "--:--:--"}</span>
    </div>
  );
}
