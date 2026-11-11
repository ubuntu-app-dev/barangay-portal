"use client";
import { motion, useReducedMotion } from "framer-motion";
import CursorTag from "./CursorTag";

const rows = [
  { name: "Brgy. Poblacion", done: true },
  { name: "Brgy. San Isidro", done: true },
  { name: "Brgy. Bagong Silang", done: false },
  { name: "Brgy. Mabini", done: false, verifyLater: true },
];

const chip =
  "min-w-[88px] rounded-full px-3 py-1 text-center text-[12px] font-semibold";
const verified = `${chip} bg-brand text-on-brand`;
const submitted = `${chip} bg-flag-gold text-ink`;

/** Barangay reports arrive and the municipality verifies them. Plays once. */
export default function ReportingScene() {
  const reduce = useReducedMotion();
  const view = { once: true };
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-6 top-7 mx-auto max-w-[360px] space-y-2.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.name}
            className="flex items-center justify-between rounded-lg border border-rule bg-panel px-3 py-2.5 shadow-sm"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ duration: 0.45, delay: i * 0.15 }}
          >
            <span className="text-[13px] font-medium">{r.name}</span>
            {r.verifyLater ? (
              <span className="relative inline-flex">
                <motion.span
                  className={submitted}
                  initial={false}
                  whileInView={reduce ? undefined : { opacity: 0 }}
                  viewport={view}
                  transition={{ delay: 1.9, duration: 0.3 }}
                >
                  Submitted
                </motion.span>
                <motion.span
                  className={`${verified} absolute inset-0`}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={view}
                  transition={{ delay: 1.9, duration: 0.3 }}
                >
                  Verified
                </motion.span>
              </span>
            ) : (
              <span className={r.done ? verified : submitted}>
                {r.done ? "Verified" : "Submitted"}
              </span>
            )}
          </motion.div>
        ))}
      </div>
      <CursorTag
        label="Municipal Personnel"
        className="bottom-[8%] right-[10%]"
        delay={1.2}
      />
    </div>
  );
}
