import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

/** Makes the portal installable as an app on phones and computers (served at /manifest.webmanifest). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${brand.name}: Barangay and Municipal LGU System`,
    short_name: brand.name,
    description: brand.tagline,
    lang: "en-PH",
    // /app sends signed-in staff to their own workspace and everyone else to sign in.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#0038a8",
    categories: ["government", "productivity"],
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
