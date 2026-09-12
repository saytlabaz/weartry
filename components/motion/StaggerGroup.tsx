"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a list of children (e.g. product cards) and staggers the
 * blur+fade+rise+scale animation across them as the group scrolls into
 * view. Repeats every time the group re-enters the viewport.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.055,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  offset = 40,
  blur = 2,
  scale = 0.985,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  blur?: number;
  scale?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: offset, scale, filter: `blur(${blur}px)` },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.44, 0, 0.56, 1] },
        },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
