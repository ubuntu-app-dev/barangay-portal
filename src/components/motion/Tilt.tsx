"use client";
import type { ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Largest tilt in degrees. */
  max?: number;
  /** Soft light that follows the pointer. */
  glare?: boolean;
  /** Resting tilt, so the element reads as 3D before it is touched. */
  rest?: { x: number; y: number };
};

/**
 * Tilts its children toward the pointer in 3D. Mouse and pen only (no effect on touch),
 * and none at all with reduced motion. Children can use translateZ for parallax depth.
 */
export default function Tilt({ children, className = "", max = 8, glare = false, rest = { x: 0, y: 0 } }: Props) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [rest.x + max, rest.x - max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [rest.y - max, rest.y + max]), spring);
  const gx = useTransform(px, [0, 1], [0, 100]);
  const gy = useTransform(py, [0, 1], [0, 100]);
  const glareOn = useSpring(0, { stiffness: 120, damping: 20 });
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.35), transparent 55%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
        glareOn.set(1);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
        glareOn.set(0);
      }}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          style={{ background: glareBg, opacity: glareOn }}
        />
      )}
    </motion.div>
  );
}
