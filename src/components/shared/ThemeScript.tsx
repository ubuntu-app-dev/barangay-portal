"use client";
import { themeInitScript } from "@/lib/theme";

/**
 * Inline script that applies the saved theme while the HTML is still being parsed, so the
 * page never flashes the wrong colors. The server sends it as JavaScript; in the browser
 * React renders it as text/plain, because React 19 warns about executable <script> tags in
 * the component tree. It has already run by then, and changing the type does not re-run it.
 * (next/script beforeInteractive was tried: it queues the code until Next.js loads, which is
 * too late and causes a flash.)
 */
export default function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
