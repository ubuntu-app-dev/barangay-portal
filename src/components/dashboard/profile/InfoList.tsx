export default function InfoList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-rule py-3 text-[14px]">
          <dt className="text-ink-secondary">{label}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
