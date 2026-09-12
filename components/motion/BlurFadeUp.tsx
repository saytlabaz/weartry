"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface BlurFadeUpProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before the animation starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Vertical offset in pixels the element rises from */
  offset?: number;
  /** Starting blur in pixels */
  blur?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
  once?: boolean;
}

/**
 * Recreates the reference site's signature hero/heading animation:
 * the element starts blurred, slightly lower and transparent, then
 * rises into place while the blur clears and opacity fades in.
 */
export default function BlurFadeUp({
  children,
  className,
  delay = 0,
  duration = 0.9,
  offset = 24,
  blur = 12,
  as = "div",
  once = true,
}: BlurFadeUpProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: offset, filter: `blur(${blur}px)` },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration,
            delay,
            ease: [0.16, 1, 0.3, 1],
          },
        },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
