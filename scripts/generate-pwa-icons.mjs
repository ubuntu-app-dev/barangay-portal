// Builds the installable-app icons in public/pwa from the shield logo.
// Run after changing public/brand/lgu-icon.svg:  node scripts/generate-pwa-icons.mjs
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile(new URL("../public/brand/lgu-icon.svg", import.meta.url));
const out = (name) => new URL(`../public/pwa/${name}`, import.meta.url).pathname;
const shield = (size) => sharp(svg, { density: 300 }).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

/** A white tile with the shield inside a margin, so launchers that crop to a circle or squircle keep all of it. */
async function tile(size, scale, file) {
  const inner = Math.round(size * scale);
  await sharp({ create: { width: size, height: size, channels: 4, background: "#ffffff" } })
    .composite([{ input: await shield(inner), gravity: "center" }])
    .png()
    .toFile(out(file));
}

await tile(192, 0.84, "icon-192.png");
await tile(512, 0.84, "icon-512.png");
// Maskable icons are cropped to the central 80% circle, so the shield stays inside 64% of the tile.
await tile(192, 0.64, "maskable-192.png");
await tile(512, 0.64, "maskable-512.png");
console.log("Icons written to public/pwa");

// Android's status-bar badge: a single-colour silhouette (only the alpha channel is used).
const shape = svg.toString().match(/<path d="([^"]+)"[^>]*fill="#0038A8"/)?.[1];
if (shape) {
  const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 0 440 600"><path d="${shape}" fill="#fff"/></svg>`;
  await sharp(Buffer.from(badge), { density: 300 }).resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out("badge-96.png"));
  console.log("Badge written");
}
