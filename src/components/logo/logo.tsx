/** Brand mark: three connected nodes (barangay, municipality, system) around a gold core. */
export default function Logo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-10 w-10 shrink-0">
      <rect width="40" height="40" rx="10" className="fill-brand" />
      <g className="stroke-white/70" strokeWidth="1.6" strokeLinecap="round">
        <line x1="20" y1="9" x2="20" y2="22" />
        <line x1="9" y1="30" x2="20" y2="22" />
        <line x1="31" y1="30" x2="20" y2="22" />
      </g>
      <g className="fill-white">
        <circle cx="20" cy="9" r="3.2" />
        <circle cx="9" cy="30" r="3.2" />
        <circle cx="31" cy="30" r="3.2" />
      </g>
      <circle cx="20" cy="22" r="4.5" className="fill-flag-gold" />
    </svg>
  );
}
