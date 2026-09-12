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
  /** Starting scale the element grows from (1 = no scale effect) */
  scale?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
  once?: boolean;
}

/**
 * The site's signature scroll-reveal animation (matches the weighted
 * rise-and-settle motion from the Saytlab reference): the element starts
 * blurred, slightly lower, slightly scaled down and transparent, then
 * rises into place while blur clears, scale settles and opacity fades in.
 * Plays once per element — it never re-triggers on repeated scroll.
 */
export default function BlurFadeUp({
  children,
  className,
  delay = 0,
  duration = 0.7,
  offset = 44,
  blur = 2,
  scale = 0.985,
  as = "div",
  once = true,
}: BlurFadeUpProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
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
          transition: {
            duration,
            delay,
            ease: [0.44, 0, 0.56, 1],
          },
        },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
