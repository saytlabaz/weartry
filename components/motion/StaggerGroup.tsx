"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a list of children (e.g. product cards) and staggers the
 * fade+rise+scale animation across them as the group scrolls into view.
 * Repeats every time the group re-enters the viewport.
 *
 * `margin` below is px-based, not %-based — Safari's IntersectionObserver
 * has a history of silently never firing on percentage rootMargin values,
 * which would leave every item permanently hidden there. See StaggerItem
 * for the matching note on why `filter: blur()` isn't animated either.
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
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -80px 0px" }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  offset = 50,
  scale = 0.94,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  scale?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  // Opacity/y/scale only — no animated `filter: blur()`. See BlurFadeUp for
  // why: Safari can leave a blur-animated element permanently invisible.
  // The spring's slight overshoot (bounce) is what gives the settle its
  // weight now that blur isn't there to do it.
  const item: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: offset, scale },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", visualDuration: 0.7, bounce: 0.24 },
        },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
