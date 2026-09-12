"use client";

import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Duration of one full loop in seconds */
  duration?: number;
  reverse?: boolean;
  gap?: string;
}

/**
 * Infinite horizontal marquee (promo bar / "DESIGNED TO MOVE" text strip /
 * testimonial rail). Duplicates its content and animates it via CSS so it
 * loops seamlessly regardless of viewport width.
 */
export default function Marquee({
  children,
  className = "",
  duration = 28,
  reverse = false,
  gap = "2.5rem",
}: MarqueeProps) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className="flex shrink-0 items-center animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          gap,
          // @ts-expect-error custom property
          "--marquee-duration": `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          gap,
          marginLeft: gap,
          // @ts-expect-error custom property
          "--marquee-duration": `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}
