"use client";
import { motion, useReducedMotion } from "framer-motion";

/** SVG path that draws itself once when scrolled into view. */
export default function DrawPath({
  d,
  delay = 0,
}: {
  d: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
    />
  );
}
