type Props = { name: string; north: string; east: string; south: string; west: string };

/** The barangay in the middle, with its neighbors to the north, east, south, and west. */
export default function BoundaryCompass({ name, north, east, south, west }: Props) {
  const cell = "flex min-h-[56px] flex-col items-center justify-center rounded-xl border border-rule bg-ground-muted px-2 py-2 text-center";
  const dir = "text-[11px] font-semibold uppercase tracking-wider text-ink-secondary";
  const place = "text-[13px] font-semibold";
  return (
    <div role="group" aria-label={`Neighbors of ${name}`} className="grid grid-cols-3 gap-2">
      <span aria-hidden="true" />
      <div className={cell}><span className={dir}>North</span><span className={place}>{north || "Not set"}</span></div>
      <span aria-hidden="true" />
      <div className={cell}><span className={dir}>West</span><span className={place}>{west || "Not set"}</span></div>
      <div className="flex min-h-[56px] items-center justify-center rounded-xl bg-brand-fill px-2 py-2 text-center text-[13px] font-bold text-white">{name}</div>
      <div className={cell}><span className={dir}>East</span><span className={place}>{east || "Not set"}</span></div>
      <span aria-hidden="true" />
      <div className={cell}><span className={dir}>South</span><span className={place}>{south || "Not set"}</span></div>
      <span aria-hidden="true" />
    </div>
  );
}
