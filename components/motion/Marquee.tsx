"use client";

import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Duration of one full loop in seconds */
  duration?: number;
  reverse?: boolean;
  gap?: string;
  /** Number of times the content is duplicated (wide screens need more copies to avoid gaps) */
  copies?: number;
  /** Fired every time a track completes one full loop — used to gradually speed up the promo bar */
  onIteration?: () => void;
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
  copies = 4,
  onIteration,
}: MarqueeProps) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      {Array.from({ length: copies }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          onAnimationIteration={i === 0 ? onIteration : undefined}
          className="flex shrink-0 items-center animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
          style={{
            gap,
            marginLeft: i === 0 ? undefined : gap,
            // @ts-expect-error custom property
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
