/**
 * The Philippine flag (2:1, blue field on top as flown in peacetime), drawn as SVG.
 * `WavingFlag` slices it into vertical strips that move in a travelling wave in 3D.
 */

const BLUE = "#0038A8";
const RED = "#CE1126";
const GOLD = "#FCD116";

/** Five-pointed star centered at (cx, cy) with outer radius r. */
function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.382;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** The sun: a disc with eight principal rays, each flanked by two minor rays. */
function sunRays(cx: number, cy: number) {
  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const base = (i * Math.PI) / 4;
    for (const [off, len, half] of [
      [0, 62, 0.11],
      [-0.2, 50, 0.05],
      [0.2, 50, 0.05],
    ] as const) {
      const a = base + off;
      const r0 = 30;
      const x1 = cx + r0 * Math.cos(a - half);
      const y1 = cy + r0 * Math.sin(a - half);
      const x2 = cx + len * Math.cos(a);
      const y2 = cy + len * Math.sin(a);
      const x3 = cx + r0 * Math.cos(a + half);
      const y3 = cy + r0 * Math.sin(a + half);
      rays.push(`M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}L${x3.toFixed(1)},${y3.toFixed(1)}Z`);
    }
  }
  return rays.join("");
}

const SUN = { x: 144, y: 250 };

export const FLAG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><rect width="1000" height="250" fill="${BLUE}"/><rect y="250" width="1000" height="250" fill="${RED}"/><path d="M0,0L433,250L0,500Z" fill="#fff"/><g fill="${GOLD}"><circle cx="${SUN.x}" cy="${SUN.y}" r="32"/><path d="${sunRays(SUN.x, SUN.y)}"/><polygon points="${star(42, 58, 22)}"/><polygon points="${star(42, 442, 22)}"/><polygon points="${star(378, 250, 22)}"/></g></svg>`;

const FLAG_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(FLAG_SVG)}")`;

type Props = {
  /** Width in px; the height is half of it. */
  width: number;
  /** Number of vertical slices. More slices make a smoother wave. */
  strips?: number;
  /** How far the cloth moves, in px. */
  amplitude?: number;
  className?: string;
  label?: string;
};

export function WavingFlag({ width, strips = 28, amplitude, className = "", label = "Flag of the Philippines" }: Props) {
  const height = width / 2;
  const sw = width / strips;
  const amp = amplitude ?? Math.max(2, width * 0.035);
  return (
    <div
      role="img"
      aria-label={label}
      className={`flag-wave relative ${className}`}
      style={{ width, height, ["--flag-amp" as string]: `${amp}px` }}
    >
      {Array.from({ length: strips }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="flag-strip absolute top-0"
          style={{
            left: i * sw,
            width: Math.ceil(sw) + 1,
            height,
            backgroundImage: FLAG_URL,
            backgroundSize: `${width}px ${height}px`,
            backgroundPosition: `${-i * sw}px 0`,
            // The wave travels from the hoist (pole side) to the fly end; the hoist barely moves.
            animationDelay: `${(-i * 0.09).toFixed(2)}s`,
            ["--strip-k" as string]: (0.25 + (0.75 * i) / strips).toFixed(3),
          }}
        />
      ))}
    </div>
  );
}
