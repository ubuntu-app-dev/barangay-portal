const pulse = "animate-pulse rounded-2xl bg-rule/70 motion-reduce:animate-none";

export function HeaderSkeleton() {
  return <div role="status" aria-label="Loading profile" className={`${pulse} h-56`} />;
}

export default function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-6 lg:grid-cols-3">
      <div className={`${pulse} h-80 lg:col-span-2`} />
      <div className={`${pulse} h-80`} />
      <div className={`${pulse} h-40 lg:col-span-3`} />
    </div>
  );
}
