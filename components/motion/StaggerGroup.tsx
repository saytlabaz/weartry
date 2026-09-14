"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a list of children (e.g. product cards) and staggers the
 * fade+rise+scale animation across them as the group scrolls into view.
 * Plays once per group by default (`once` defaults to true) — pass
 * once={false} for a section that should replay every time it re-enters
 * the viewport. Pass `immediate` for an above-the-fold group that should
 * stagger in on mount instead of waiting on IntersectionObserver.
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
  once = true,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
  immediate?: boolean;
}) {
  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger },
    },
  };

  if (immediate) {
    return (
      <motion.div className={className} initial="hidden" animate="visible" variants={container}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.12, margin: "0px 0px 150px 0px" }}
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
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
  scale?: number;
  immediate?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const resolvedOffset = immediate ? Math.min(offset, 28) : offset;

  // Opacity/y/scale only — no animated `filter: blur()`. See BlurFadeUp for
  // why: Safari can leave a blur-animated element permanently invisible.
  // The spring's slight overshoot (bounce) is what gives the settle its
  // weight now that blur isn't there to do it.
  const item: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: resolvedOffset, scale: immediate ? 1 : scale },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : immediate
        ? { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.44, 0, 0.56, 1] } }
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
