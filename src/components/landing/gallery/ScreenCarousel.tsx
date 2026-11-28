"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Screen } from "@/types/landing";

const AUTOPLAY_MS = 5500;

/** Shortest signed distance from `active` to `i` on a ring of `n` slides. */
function offset(i: number, active: number, n: number) {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

/**
 * 3D cover-flow of real screenshots. Autoplays (paused on hover, focus, or reduced motion);
 * arrows, the screen tabs, the side slides, swipes, and the arrow keys all change the slide.
 */
export default function ScreenCarousel({ screens }: { screens: Screen[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = screens.length;
  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce, go]);

  const current = screens[active];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Screens of the platform"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="rounded-2xl outline-offset-8"
    >
      {/* Tabs: one per screen */}
      <div role="tablist" aria-label="Choose a screen" className="mx-auto flex max-w-full flex-wrap justify-center gap-2">
        {screens.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => go(i)}
              className={`relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${on ? "text-white" : "text-ink-secondary hover:bg-panel hover:text-ink"}`}
            >
              {on && (
                <motion.span
                  layoutId="screen-tab"
                  className="absolute inset-0 rounded-full bg-brand-fill shadow-[0_6px_16px_rgb(0_56_168/0.3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Stage */}
      <div
        className="relative mx-auto mt-10 aspect-[16/10] w-full max-w-[1000px] touch-pan-y [perspective:1800px] sm:aspect-[2/1]"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {screens.map((s, i) => {
            const d = offset(i, active, n);
            const a = Math.abs(d);
            const hidden = a > 2;
            return (
              <motion.button
                key={s.title}
                type="button"
                tabIndex={d === 0 ? -1 : hidden ? -1 : 0}
                aria-hidden={d !== 0}
                aria-label={d === 0 ? undefined : `Show ${s.title}`}
                onClick={() => d !== 0 && go(i)}
                className={`absolute left-1/2 top-0 w-[78%] -translate-x-1/2 sm:w-[70%] ${d === 0 ? "cursor-default" : "cursor-pointer"}`}
                style={{ zIndex: 10 - a, pointerEvents: hidden ? "none" : "auto" }}
                initial={false}
                animate={{
                  x: `${d * (reduce ? 62 : 52)}%`,
                  z: -a * 260,
                  rotateY: reduce ? 0 : Math.max(-1, Math.min(1, d)) * -32,
                  scale: 1 - a * 0.08,
                  opacity: hidden ? 0 : 1 - a * 0.28,
                }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, mass: 0.9 }}
              >
                <figure className="overflow-hidden rounded-xl border border-rule bg-panel shadow-[0_30px_70px_rgb(0_25_80/0.28)]">
                  <div className="flex items-center gap-1.5 border-b border-rule bg-ground-muted px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-flag-red/80" />
                    <span className="h-2 w-2 rounded-full bg-flag-gold" />
                    <span className="h-2 w-2 rounded-full bg-brand/70" />
                    <span className="ml-2 truncate text-[11px] text-ink-secondary">{s.title}</span>
                  </div>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={1440}
                    height={900}
                    sizes="(min-width: 1024px) 700px, 80vw"
                    className="block h-auto w-full select-none"
                    draggable={false}
                    priority={i === 0}
                  />
                </figure>
              </motion.button>
            );
          })}
        </div>
        {/* Floor shadow */}
        <div aria-hidden="true" className="absolute -bottom-6 left-1/2 h-10 w-[60%] -translate-x-1/2 rounded-[50%] bg-brand/20 blur-2xl" />
      </div>

      {/* Caption and arrows */}
      <div className="mx-auto mt-6 flex max-w-[720px] items-center gap-4">
        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="Previous screen"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-panel text-ink shadow-sm transition hover:-translate-x-0.5 hover:border-brand hover:text-brand"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <div className="min-h-[72px] flex-1 text-center" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.title}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="font-display text-xl font-bold tracking-[-0.02em]">{current.title}</p>
              <p className="mt-1 text-[15px] text-ink-secondary">{current.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="Next screen"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-panel text-ink shadow-sm transition hover:translate-x-0.5 hover:border-brand hover:text-brand"
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      {/* Autoplay progress */}
      <div aria-hidden="true" className="mx-auto mt-5 flex max-w-[220px] gap-1.5">
        {screens.map((s, i) => (
          <span key={s.title} className="h-1 flex-1 overflow-hidden rounded-full bg-rule">
            {i === active && (
              <span
                key={`${active}-${paused}`}
                className={`block h-full rounded-full bg-brand ${reduce || paused ? "w-full" : "carousel-progress"}`}
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
