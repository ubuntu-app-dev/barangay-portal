/** Thin blue, red and gold rule echoing the national colors. Decorative only. */
export default function TricolorRule() {
  return (
    <div aria-hidden="true" className="flex h-1.5">
      <span className="flex-[2] bg-brand" />
      <span className="flex-1 bg-flag-red" />
      <span className="flex-1 bg-flag-gold" />
    </div>
  );
}
