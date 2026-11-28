"use client";
import { motion, useScroll, useSpring } from "framer-motion";

/** Thin tricolor bar under the header that fills as the page is read. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-[3px] origin-left bg-[linear-gradient(90deg,var(--color-brand),var(--color-flag-red),var(--color-flag-gold))]"
      style={{ scaleX }}
    />
  );
}
