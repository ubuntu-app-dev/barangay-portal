"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type Props = { children: ReactNode; className?: string };

export function StaggerList({ children, className }: Props) {
  return (
    <motion.ul
      className={className}
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerItem({ children, className }: Props) {
  return (
    <motion.li className={className} variants={item}>
      {children}
    </motion.li>
  );
}
