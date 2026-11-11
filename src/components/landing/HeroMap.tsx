import { LiquidGlassLogo } from "@/components/liquid-glass-logo"; // installed by: npx shadcn@latest add https://reactdrops.dev/r/liquid-glass-logo.json

/**
 * Liquid-glass entrance that settles on the Philippines map, on the page's own ground color.
 * Map size: logoSize is only a ceiling. The real size is the smallest of logoSize,
 * canvas width / 1.9 and canvas height / 1.5, so to make the map bigger widen the canvas
 * (see .hero-map in portal.css) or raise height here. logoColor is the flag blue; use
 * "#09111b" for near-black or "original" to keep the colors inside the SVG.
 */
export default function HeroMap() {
  return (
    <LiquidGlassLogo
      className="hero-map"
      logo="/philippines.svg"
      ending="logo"
      theme="light"
      background="#fcfcfd"
      logoColor="#0038a8"
      logoSize={520}
      logoScale={1}
      height="clamp(380px, 50vw, 620px)"
      aria-label="Map of the Philippines"
    />
  );
}
