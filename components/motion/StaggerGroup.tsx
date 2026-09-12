"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a list of children (e.g. product cards) and staggers the
 * blur+fade+rise animation across them as the group scrolls into view.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
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
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  offset = 20,
  blur = 10,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  blur?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  const item: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: offset, filter: `blur(${blur}px)` },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
