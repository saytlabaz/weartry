"use client";

import { useState } from "react";
import Image from "next/image";

// Simulated alternate angles via filter variants — swap for real product photography.
const THUMB_FILTERS = ["", "brightness-110 saturate-125", "hue-rotate-12 saturate-150", "grayscale-[0.35] brightness-95"];

export default function ProductGallery({ gradient, images }: { gradient: string; images?: string[] }) {
  const [active, setActive] = useState(0);

  if (images && images.length > 0) {
    const src = images[active] ?? images[0];
    return (
      <div>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-50">
          <Image src={src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View ${i + 1}`}
                className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-colors ${
                  active === i ? "ring-neutral-900" : "ring-transparent hover:ring-neutral-300"
                }`}
              >
                <Image src={img} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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
