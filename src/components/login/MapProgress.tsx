"use client";
import { motion, useReducedMotion } from "framer-motion";

const mask =
  "[-webkit-mask-image:url(/philippines.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] [mask-image:url(/philippines.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

/** Decorative progress meter shaped like the Philippines: the gold fills from the bottom up (0 to 1). */
export default function MapProgress({ progress, className = "" }: { progress: number; className?: string }) {
  const reduce = useReducedMotion();
  const hidden = `${Math.round((1 - progress) * 100)}%`;
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div className={`absolute inset-0 bg-on-field/10 ${mask}`} />
      <motion.div
        className={`absolute inset-0 bg-flag-gold ${mask}`}
        initial={false}
        animate={{ clipPath: `inset(${hidden} 0% 0% 0%)` }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
