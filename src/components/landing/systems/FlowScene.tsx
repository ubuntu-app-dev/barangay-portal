const tile = (x: number, y: number, w: number, h: number, label: string) => (
  <g key={label}>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="10"
      fill="#fff"
      stroke="#dde0e6"
    />
    <text
      x={x + w / 2}
      y={y + h / 2 + 4.5}
      textAnchor="middle"
      fontSize="13"
      fontWeight="600"
      fill="#16191f"
    >
      {label}
    </text>
  </g>
);

const dots = [
  { path: "M112,92 L248,92", begin: "0s", dur: "2.6s" },
  { path: "M112,92 L248,92", begin: "1.3s", dur: "2.6s" },
  { path: "M180,152 L180,126", begin: "0.6s", dur: "1.8s" },
];

/** Barangay, platform, municipality and Superadmin on one line of flow. Dots travel a few times, then rest. */
export default function FlowScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 200"
        className="h-auto w-full max-w-[420px] px-4 font-display"
      >
        <defs>
          <linearGradient id="flow-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f55c9" />
            <stop offset="1" stopColor="#002a80" />
          </linearGradient>
        </defs>
        <g stroke="#8fa6d8" strokeWidth="2">
          <line x1="112" y1="92" x2="146" y2="92" />
          <line x1="214" y1="92" x2="248" y2="92" />
          <line x1="180" y1="126" x2="180" y2="152" />
        </g>
        <circle cx="180" cy="92" r="34" fill="url(#flow-fill)" />
        <circle
          cx="180"
          cy="92"
          r="38"
          fill="none"
          stroke="#fcd116"
          strokeWidth="2.5"
        />
        <text
          x="180"
          y="97"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="#fff"
        >
          LGU
        </text>
        {tile(14, 70, 98, 44, "Barangay")}
        {tile(248, 70, 98, 44, "Municipal")}
        {tile(131, 152, 98, 36, "Superadmin")}
        <g fill="#fcd116" stroke="#fff" strokeWidth="1.5">
          {dots.map((d, i) => (
            <circle key={i} r="5" className="flow-dot">
              <animateMotion
                path={d.path}
                begin={d.begin}
                dur={d.dur}
                repeatCount="3"
              />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}
