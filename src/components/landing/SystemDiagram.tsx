const tile = (x: number, y: number, w: number, label: string) => (
  <g key={label}>
    <rect
      x={x}
      y={y}
      width={w}
      height="46"
      rx="12"
      fill="#fff"
      stroke="#dde0e6"
    />
    <text
      x={x + w / 2}
      y={y + 28}
      textAnchor="middle"
      fontSize="15"
      fontWeight="600"
      fill="#16191f"
    >
      {label}
    </text>
  </g>
);

const flows = ["M200,66 L200,138", "M110,310 L158,248", "M290,310 L242,248"];

export default function SystemDiagram() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="mx-auto h-auto w-full max-w-[420px] font-display"
      role="img"
      aria-labelledby="diagram-title"
    >
      <title id="diagram-title">
        The Barangay System, the Municipal System, and the Superadmin all
        connect to one central LGU platform.
      </title>
      <defs>
        <linearGradient id="diagram-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f55c9" />
          <stop offset="1" stopColor="#002a80" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="78" fill="none" stroke="#c9d3ee" />
      <circle cx="200" cy="200" r="142" fill="none" stroke="#dde3f3" />
      <g stroke="#8fa6d8" strokeWidth="2">
        <line x1="200" y1="138" x2="200" y2="66" />
        <line x1="158" y1="248" x2="110" y2="310" />
        <line x1="242" y1="248" x2="290" y2="310" />
      </g>
      <circle cx="200" cy="200" r="62" fill="url(#diagram-fill)" />
      <circle
        cx="200"
        cy="200"
        r="67"
        fill="none"
        stroke="#fcd116"
        strokeWidth="3"
        className="ring-pulse"
      />
      <text
        x="200"
        y="196"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#fff"
      >
        Central
      </text>
      <text
        x="200"
        y="216"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#fff"
      >
        platform
      </text>
      {tile(110, 20, 180, "Barangay System")}
      {tile(12, 310, 176, "Municipal System")}
      {tile(212, 310, 176, "Superadmin")}
      <g fill="#fcd116" stroke="#fff" strokeWidth="1.5">
        {flows.map((d, i) => (
          <circle key={d} r="5" className="flow-dot">
            <animateMotion
              dur="2.4s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
