const pulse = "animate-pulse rounded-xl bg-rule/70 motion-reduce:animate-none";

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <div className={`${pulse} h-28`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className={`${pulse} h-36`} />)}
      </div>
      <div className={`${pulse} h-24`} />
      <div className="grid gap-6 xl:grid-cols-3"><div className={`${pulse} h-72`} /><div className={`${pulse} h-72 xl:col-span-2`} /></div>
      <div className={`${pulse} h-80`} />
    </div>
  );
}

export function ShellSkeleton() {
  return <div role="status" aria-label="Loading" className="grid min-h-dvh place-items-center bg-ground-muted text-[15px] text-ink-secondary">Loading your workspace&hellip;</div>;
}
