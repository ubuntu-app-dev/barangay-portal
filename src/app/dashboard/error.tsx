"use client";
import Link from "next/link";
import Icon from "@/components/dashboard/ui/Icon";

/** Shown when a dashboard page fails to load (for example, the database is unreachable). */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="surface mx-auto flex max-w-[560px] flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-danger-soft text-dash-danger">
        <Icon name="alert" className="h-6 w-6" />
      </span>
      <h1 className="font-display text-xl font-bold">This page could not load</h1>
      <p className="text-[15px] text-ink-secondary">
        {error.message.includes("permission") ? error.message : "Something went wrong while loading your barangay's records. Check your connection and try again."}
      </p>
      {error.digest && <p className="text-[12px] text-ink-secondary">Reference: {error.digest}</p>}
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          <Icon name="refresh" className="h-4 w-4" /> Try again
        </button>
        <Link href="/dashboard" className="btn btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
