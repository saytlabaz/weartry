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
  /**
   * Above-the-fold elements (hero title, first CTA, etc.) should not wait
   * on IntersectionObserver at all — they animate in the instant the
   * component mounts, since they're already on screen at page load.
   * Uses a plain fade+rise tween instead of the scroll-reveal spring.
   */
  immediate?: boolean;
}

/**
 * The site's signature reveal animation. Two modes:
 *
 * - `immediate` (above-the-fold): fades/rises in on mount, no
 *   IntersectionObserver involved — a 0.6-0.8s tween with a soft
 *   ease-in-out curve, since the element is already visible at load.
 * - scroll-reveal (default, below-the-fold): triggers via `whileInView`
 *   with an expanded viewport margin so sections start animating just
 *   before they'd otherwise become visible, rather than after — and
 *   plays once (`once` defaults to true) so repeat scrolling past a
 *   section doesn't repeat the animation. Uses a weighted,
 *   slightly-overshooting spring — that overshoot (bounce) is what reads
 *   as "heavy"/premium motion, standing in for the blur effect this used
 *   to lean on.
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
  once = true,
  immediate = false,
}: BlurFadeUpProps) {
  const shouldReduceMotion = useReducedMotion();
  const resolvedOffset = immediate ? Math.min(offset, 28) : offset;

  const variants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: resolvedOffset, scale: immediate ? 1 : scale },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : immediate
        ? {
            opacity: 1,
            y: 0,
            transition: {
              duration: Math.min(Math.max(duration, 0.6), 0.8),
              ease: [0.44, 0, 0.56, 1],
              delay,
            },
          }
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

  if (immediate) {
    return (
      <MotionTag className={className} initial="hidden" animate="visible" variants={variants}>
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.12, margin: "0px 0px 150px 0px" }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
