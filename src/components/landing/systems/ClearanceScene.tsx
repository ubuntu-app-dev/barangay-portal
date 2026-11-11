"use client";
import { motion, useReducedMotion } from "framer-motion";
import CursorTag from "./CursorTag";

const fields = [
  ["Resident", "72%"],
  ["Purpose", "54%"],
  ["Address", "63%"],
];

/** A barangay clearance fills in, then gets stamped. Plays once. */
export default function ClearanceScene() {
  const reduce = useReducedMotion();
  const view = { once: true };
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-6 -bottom-6 top-7 mx-auto max-w-[380px] rounded-xl border border-rule bg-panel p-5 shadow-[0_12px_30px_rgb(22_25_31/0.12)]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-bold">
            Barangay Clearance
          </span>
          <span className="flex h-6 w-6 overflow-hidden rounded-full">
            <i className="h-full flex-[2] bg-brand" />
            <i className="h-full flex-1 bg-flag-red" />
            <i className="h-full flex-1 bg-flag-gold" />
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {fields.map(([label, width], i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-16 text-[12px] text-ink-secondary">
                {label}
              </span>
              <motion.span
                className="h-2.5 origin-left rounded-full bg-brand/25"
                style={{ width }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={view}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.35,
                  ease: "easeOut",
                }}
              />
            </div>
          ))}
        </div>
        <motion.div
          className="absolute bottom-12 right-5 -rotate-[8deg] rounded-md border-2 border-flag-red px-3 py-1 font-display text-[15px] font-bold tracking-wide text-flag-red"
          initial={reduce ? false : { opacity: 0, scale: 1.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={view}
          transition={{
            delay: 1.7,
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
        >
          ISSUED
        </motion.div>
      </div>
      <CursorTag
        label="Barangay Secretary"
        className="bottom-[30%] left-[8%]"
        delay={1}
      />
    </div>
  );
}
