"use client";

import { useEffect, useRef } from "react";

const HOT_SELECTOR =
  'a, button, input, textarea, select, label, summary, [role="button"], [data-cursor-hot]';

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

/**
 * Recreates the Saytlab reference's circular custom cursor: a small dot
 * that tracks the mouse exactly, and a larger ring that eases toward it
 * (lerp) for a soft, circular trailing feel. Ring grows and glows over
 * interactive elements. Fine-pointer devices only; fully disabled under
 * prefers-reduced-motion and on touch/coarse-pointer devices.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!finePointer || reduceMotion) return;

    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    root.classList.add("cursor-custom");

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let rafId = 0;

    function handleMouseMove(e: MouseEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
    }

    function handleMouseOver(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest?.(HOT_SELECTOR)) {
        root.classList.add("cursor-hot");
      }
    }

    function handleMouseOut(e: MouseEvent) {
      const target = e.target as Element | null;
      const related = e.relatedTarget as Element | null;
      if (target?.closest?.(HOT_SELECTOR) && !related?.closest?.(HOT_SELECTOR)) {
        root.classList.remove("cursor-hot");
      }
    }

    function handleLeave() {
      root.classList.add("cursor-hidden");
    }

    function handleEnter() {
      root.classList.remove("cursor-hidden");
    }

    function handleWindowMouseOut(e: MouseEvent) {
      if (!e.relatedTarget) handleLeave();
    }

    function frame() {
      dot!.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      ringX = lerp(ringX, pointerX, 0.2);
      ringY = lerp(ringY, pointerY, 0.2);
      ring!.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
      rafId = requestAnimationFrame(frame);
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    // Bound to `window`, not `document.documentElement` — the latter is a
    // real DOM node that page transitions mutate (large subtrees unmount
    // and remount under the pointer), which can fire spurious mouseleave/
    // mouseenter on it and leave the cursor stuck hidden. `window`'s
    // leave/enter only fire when the pointer actually crosses the viewport
    // edge, so it isn't affected by DOM churn during route changes.
    window.addEventListener("mouseout", handleWindowMouseOut, { passive: true });
    window.addEventListener("mouseover", handleEnter, { passive: true });
    window.addEventListener("blur", handleLeave);

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mouseout", handleWindowMouseOut);
      window.removeEventListener("mouseover", handleEnter);
      window.removeEventListener("blur", handleLeave);
      root.classList.remove("cursor-custom", "cursor-hot", "cursor-hidden");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
