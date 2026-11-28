/**
 * Brand mark: the LGU shield (sun, three stars, and the community under one roof).
 * Shows the dark-mode artwork when the dark theme is on. On blue panels (`onDark`)
 * it sits on a white tile so the blue shield does not disappear into the background.
 */
export default function Logo({ onDark = false, className = "h-10 w-10" }: { onDark?: boolean; className?: string }) {
  if (onDark) {
    return (
      <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-sm ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimization needed */}
        <img src="/brand/lgu-icon.svg" alt="" className="h-full w-full" draggable={false} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={`relative block shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimization needed */}
      <img src="/brand/lgu-icon.svg" alt="" className="h-full w-full dark:hidden" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG, no optimization needed */}
      <img src="/brand/lgu-icon-dark.svg" alt="" className="hidden h-full w-full dark:block" draggable={false} />
    </span>
  );
}
