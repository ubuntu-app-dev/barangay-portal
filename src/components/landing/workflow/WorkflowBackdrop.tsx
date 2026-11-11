"use client";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/** Decorative: dotted texture plus two soft glows that drift slowly as the section scrolls past. */
export default function WorkflowBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const goldY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);
  const redY = useTransform(scrollYProgress, [0, 1], ["14%", "-14%"]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle,rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <motion.div
        style={reduce ? undefined : { y: goldY }}
        className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-flag-gold/25 blur-3xl"
      />
      <motion.div
        style={reduce ? undefined : { y: redY }}
        className="absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full bg-flag-red/30 blur-3xl"
      />
    </div>
  );
}
