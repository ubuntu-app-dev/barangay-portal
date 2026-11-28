"use client";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  text: string;
  /** Words shown in the brand blue. */
  highlight?: string[];
  className?: string;
};

/** h1 whose words rise into place one after another, flipping up slightly in 3D. */
export default function AnimatedHeadline({ text, highlight = [], className = "" }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <h1 className={`[perspective:800px] ${className}`}>
      {words.map((w, i) => {
        const bare = w.replace(/[.,!?]$/, "");
        const blue = highlight.includes(bare);
        return (
          <span key={i}>
            <motion.span
              className={`inline-block origin-bottom ${blue ? "text-brand" : ""}`}
              initial={reduce ? false : { opacity: 0, y: "0.45em", rotateX: -70 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </h1>
  );
}
