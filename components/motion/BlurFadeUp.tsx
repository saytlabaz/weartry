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
  /** Starting scale the element grows from (1 = no scale effect) */
  scale?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
  once?: boolean;
}

/**
 * The site's signature scroll-reveal animation: the element starts
 * lower, scaled down and transparent, then settles into place with a
 * weighted, slightly-overshooting spring — that overshoot (bounce) is
 * what reads as "heavy"/premium motion, standing in for the blur effect
 * this used to lean on. Repeats on every viewport entry/exit by default —
 * pass once={true} for a single-play element.
 *
 * Deliberately opacity/y/scale only — no animated `filter: blur()`.
 * Safari's compositor has a long-standing bug where an animated blur
 * filter combined with a transform can leave the element permanently
 * stuck at its hidden (invisible) state, so the reveal never plays there
 * even though it works fine in Chrome.
 *
 * The viewport margin below is also px-based rather than %-based for the
 * same cross-browser reason: Safari's IntersectionObserver has a history
 * of mishandling percentage rootMargin values (the trigger silently never
 * fires), which independently produces the exact same symptom — elements
 * that stay invisible forever in Safari but reveal fine in Chrome.
 */
export default function BlurFadeUp({
  children,
  className,
  delay = 0,
  duration = 0.7,
  offset = 56,
  scale = 0.94,
  as = "div",
  once = false,
}: BlurFadeUpProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: offset, scale },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            visualDuration: duration,
            bounce: 0.24,
            delay,
          },
        },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2, margin: "0px 0px -80px 0px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
