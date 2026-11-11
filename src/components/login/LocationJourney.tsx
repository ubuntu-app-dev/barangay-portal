"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type JourneyStep = { key: string; label: string; value?: string; done: boolean };

/** The chosen location, building up step by step. A gold line draws down as each step is completed. */
export default function LocationJourney({ steps }: { steps: JourneyStep[] }) {
  const reduce = useReducedMotion();
  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <ol aria-label="Your location so far">
      {steps.map((s, i) => {
        const current = i === currentIndex;
        return (
          <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
            {i < steps.length - 1 && (
              <>
                <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-9 w-0.5 bg-on-field-secondary/25" />
                <motion.span aria-hidden="true" initial={false} animate={{ scaleY: s.done ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }} className="absolute bottom-0 left-[15px] top-9 w-0.5 origin-top bg-flag-gold" />
              </>
            )}
            <motion.span
              animate={{ scale: s.done && !reduce ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.45 }}
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                s.done ? "border-flag-gold bg-flag-gold text-ink" : current ? "border-flag-gold text-flag-gold" : "border-on-field-secondary/40 text-on-field-secondary"
              }`}
            >
              {s.done ? (
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3.2 3L13 4.5" /></svg>
              ) : (
                <span className="text-[13px] font-bold">{i + 1}</span>
              )}
            </motion.span>
            <span className="block max-w-[11rem] pt-0.5">
              <span className="block text-[13px] text-on-field-secondary">{s.label}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={s.value ?? "pending"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={`block font-display text-[17px] font-semibold leading-snug ${s.value ? "" : "text-on-field-secondary"}`}
                >
                  {s.value ?? (current ? "Choose below" : "Waiting")}
                </motion.span>
              </AnimatePresence>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
