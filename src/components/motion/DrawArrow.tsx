"use client";
import { motion } from "framer-motion";

/** Arrow that draws itself once when scrolled into view. */
export default function DrawArrow({ className }: { className?: string }) {
  const view = { once: true };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M4 12h68"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={view}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.path
        d="M62 4l10 8-10 8"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={view}
        transition={{ duration: 0.4, delay: 0.7 }}
      />
    </svg>
  );
}
