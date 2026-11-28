"use client";
import { useEffect, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { THEME_EVENT, applyTheme, readTheme, saveTheme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  mq.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    mq.removeEventListener("change", onChange);
  };
}
const isDarkNow = () => document.documentElement.classList.contains("dark");

/** Stars that twinkle in on the night side of the track. */
const STARS = [
  { x: 9, y: 7, s: 2 },
  { x: 16, y: 17, s: 1.5 },
  { x: 24, y: 9, s: 1.5 },
  { x: 13, y: 22, s: 1 },
];

/**
 * Light/dark switch: a sky track with a sun that rolls across and turns into a moon.
 * Until it is used, the site follows the device setting. Changing it plays a circular
 * reveal of the new theme from the switch (see saveTheme).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false);

  // While no choice is saved, keep following the device when its setting changes.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (readTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 32 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        saveTheme(dark ? "light" : "dark", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={`group relative inline-flex h-8 w-[60px] shrink-0 items-center overflow-hidden rounded-full p-1 shadow-[inset_0_1px_3px_rgb(0_0_0/0.25)] ring-1 ring-black/5 transition-[background-color] duration-500 focus-visible:outline-offset-2 dark:ring-white/10 ${
        dark ? "bg-[#0d1b3d]" : "bg-[#7cc3ff]"
      } ${className}`}
    >
      {/* Day sky: a soft cloud */}
      <motion.span
        aria-hidden="true"
        className="absolute right-2 top-[9px] h-2.5 w-5 rounded-full bg-white/90"
        animate={{ opacity: dark ? 0 : 1, x: dark ? 12 : 0 }}
        transition={spring}
      >
        <span className="absolute -top-1 left-1.5 h-3 w-3 rounded-full bg-white/90" />
      </motion.span>

      {/* Night sky: twinkling stars */}
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-white"
          style={{ left: s.x, top: s.y, width: s.s, height: s.s }}
          animate={{ opacity: dark ? [0, 1, 0.5, 1] : 0, scale: dark ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: dark ? 0.1 + i * 0.08 : 0 }}
        />
      ))}

      {/* Knob: sun by day, moon by night */}
      <motion.span
        aria-hidden="true"
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full"
        animate={{
          x: dark ? 28 : 0,
          rotate: dark ? 360 : 0,
          backgroundColor: dark ? "#e6ebf5" : "#ffd60a",
          boxShadow: dark
            ? "0 0 10px 2px rgb(200 215 255 / 0.35)"
            : "0 0 12px 3px rgb(255 214 10 / 0.55)",
        }}
        transition={spring}
      >
        {/* Moon craters, fading in as the sun turns */}
        <motion.span className="absolute inset-0" animate={{ opacity: dark ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.3 }}>
          <span className="absolute left-[6px] top-[5px] h-1.5 w-1.5 rounded-full bg-[#b9c3d8]" />
          <span className="absolute bottom-[5px] right-[6px] h-2 w-2 rounded-full bg-[#b9c3d8]" />
          <span className="absolute bottom-[8px] left-[5px] h-1 w-1 rounded-full bg-[#b9c3d8]" />
        </motion.span>
        {/* Sun rays */}
        <motion.svg
          viewBox="0 0 24 24"
          className="absolute -inset-1 h-8 w-8 text-[#ffd60a]"
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.4 : 1, rotate: dark ? -90 : 0 }}
          transition={spring}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1="12"
              y1="1.2"
              x2="12"
              y2="3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform={`rotate(${i * 45} 12 12)`}
            />
          ))}
        </motion.svg>
      </motion.span>
    </button>
  );
}
