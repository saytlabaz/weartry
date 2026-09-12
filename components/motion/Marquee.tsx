"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Duration of one full loop in seconds */
  duration?: number;
  reverse?: boolean;
  gap?: string;
  /** Force a fixed number of copies instead of auto-measuring (skips ResizeObserver) */
  copies?: number;
  /** Fired every time a track completes one full loop — used to gradually speed up the promo bar */
  onIteration?: () => void;
}

const MIN_COPIES = 3;
const DEFAULT_COPIES = 6;

/**
 * Infinite horizontal marquee (promo bar / "DESIGNED TO MOVE" text strip /
 * testimonial rail). Duplicates its content and animates it via CSS so it
 * loops seamlessly regardless of viewport width.
 *
 * When `copies` isn't given, the number of duplicates is measured live: it
 * keeps re-rendering enough copies to cover at least 3x the container's own
 * width, so short content never leaves a visible gap at the loop point on
 * wide screens.
 */
export default function Marquee({
  children,
  className = "",
  duration = 28,
  reverse = false,
  gap = "2.5rem",
  copies: copiesProp,
  onIteration,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [autoCopies, setAutoCopies] = useState(DEFAULT_COPIES);

  useEffect(() => {
    if (copiesProp != null) return;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    function recompute() {
      const containerWidth = container!.getBoundingClientRect().width || window.innerWidth;
      const trackWidth = track!.getBoundingClientRect().width;
      if (trackWidth <= 0) return;
      const needed = Math.max(MIN_COPIES, Math.ceil((containerWidth * 3) / trackWidth));
      setAutoCopies((prev) => (prev === needed ? prev : needed));
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [copiesProp]);

  const copies = copiesProp ?? autoCopies;

  return (
    <div ref={containerRef} className={`group relative flex overflow-hidden ${className}`}>
      {Array.from({ length: copies }).map((_, i) => (
        <div
          key={i}
          ref={i === 0 ? trackRef : undefined}
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
