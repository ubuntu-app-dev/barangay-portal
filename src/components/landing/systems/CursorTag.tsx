"use client";
import { motion, useReducedMotion } from "framer-motion";

type Props = { label: string; className?: string; delay?: number };

/** A cursor with a role label that glides into place once when scrolled into view. */
export default function CursorTag({ label, className = "", delay = 0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute z-20 flex items-start ${className}`}
      initial={reduce ? false : { opacity: 0, x: 36, y: 28 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg
        width="22"
        height="26"
        viewBox="0 0 26 30"
        className="drop-shadow-md"
      >
        <path
          d="M2.2 2.5 22 15.1l-9.4 2.1-4.1 9.1L2.2 2.5Z"
          fill="#fcd116"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </svg>
      <span className="ml-1 mt-4 whitespace-nowrap rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-on-brand shadow-md">
        {label}
      </span>
    </motion.div>
  );
}
