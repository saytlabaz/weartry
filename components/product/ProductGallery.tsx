"use client";

import { useState } from "react";

// Simulated alternate angles via filter variants — swap for real product photography.
const THUMB_FILTERS = ["", "brightness-110 saturate-125", "hue-rotate-12 saturate-150", "grayscale-[0.35] brightness-95"];

export default function ProductGallery({ gradient }: { gradient: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className={`aspect-[3/4] w-full rounded-2xl bg-gradient-to-br ${gradient} ${THUMB_FILTERS[active]}`} />
      <div className="mt-3 grid grid-cols-4 gap-3">
        {THUMB_FILTERS.map((filter, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View ${i + 1}`}
            className={`aspect-square overflow-hidden rounded-lg ring-2 transition-colors ${
              active === i ? "ring-neutral-900" : "ring-transparent hover:ring-neutral-300"
            }`}
          >
            <div className={`h-full w-full bg-gradient-to-br ${gradient} ${filter}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
