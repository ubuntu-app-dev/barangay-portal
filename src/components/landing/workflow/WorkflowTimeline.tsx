"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { steps as workflowSteps } from "@/data/landing-content";
import { LandingIcon } from "../icons";

/**
 * Each step lights up as it scrolls into view, and a gold line draws to the next step.
 * Horizontal on wide screens, vertical on phones. With reduced motion, everything is shown complete.
 */
export default function WorkflowTimeline() {
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(0);
  const reached = reduce ? workflowSteps.length : seen;
  const last = workflowSteps.length - 1;
  const draw = {
    duration: reduce ? 0 : 0.7,
    delay: reduce ? 0 : 0.25,
    ease: "easeInOut",
  } as const;

  return (
    <ol className="mt-14 grid gap-8 lg:grid-cols-4 lg:gap-0">
      {workflowSteps.map((s, i) => {
        const on = i < reached;
        const linked = i + 1 < reached;
        return (
          <motion.li
            key={s.title}
            className="relative pl-[76px] lg:flex lg:flex-col lg:px-3 lg:pl-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -30% 0px" }}
            onViewportEnter={() => setSeen((n) => Math.max(n, i + 1))}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {i < last && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute left-[27px] top-7 h-[calc(100%+2rem)] w-0.5 bg-on-field-secondary/25 lg:hidden"
                />
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ scaleY: linked ? 1 : 0 }}
                  transition={draw}
                  className="absolute left-[27px] top-7 h-[calc(100%+2rem)] w-0.5 origin-top bg-flag-gold lg:hidden"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[27px] hidden h-0.5 w-full bg-on-field-secondary/25 lg:block"
                />
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ scaleX: linked ? 1 : 0 }}
                  transition={draw}
                  className="absolute left-1/2 top-[27px] hidden h-0.5 w-full origin-left bg-flag-gold lg:block"
                />
              </>
            )}

            <span className="absolute left-0 top-0 z-10 h-14 w-14 lg:relative lg:mx-auto">
              {on && !reduce && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border-2 border-flag-gold"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              )}
              <motion.span
                animate={{ scale: on ? 1 : 0.92 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-300 motion-reduce:transition-none ${
                  on
                    ? "border-flag-gold bg-flag-gold text-[#16191f]"
                    : "border-on-field-secondary/40 bg-black/30 text-on-field"
                }`}
              >
                <LandingIcon name={s.icon} className="h-6 w-6" />
              </motion.span>
            </span>

            <div className="rounded-panel border border-on-field-secondary/20 bg-white/10 p-5 text-left backdrop-blur-sm lg:mt-5 lg:flex-1 lg:text-center">
              <p className="text-[13px] font-semibold text-flag-gold">
                Step {i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.02em]">
                {s.title}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-on-field">
                {s.actor}
              </p>
              <p className="mt-3 text-[15px] text-on-field-secondary">
                {s.text}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
