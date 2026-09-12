"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/data";
import ProductCard from "@/components/home/ProductCard";
import { StaggerGroup } from "@/components/motion/StaggerGroup";

const FILTERS: { key: string; category: Product["category"] | "all" }[] = [
  { key: "filterAll", category: "all" },
  { key: "filterJacket", category: "jacket" },
  { key: "filterHoodie", category: "hoodie" },
  { key: "filterPants", category: "pants" },
  { key: "filterTshirt", category: "tshirt" },
];

/**
 * Shared heading + filter-tabs + product grid, used by both the homepage
 * Best Sellers teaser and the full /products listing page.
 */
export default function ProductFilterGrid({ products, heading }: { products: Product[]; heading: ReactNode }) {
  const t = useTranslations("Sections.bestSellers");
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [products, active]
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {heading}

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.category)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active === f.category
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-border text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
      </div>

      <StaggerGroup className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </StaggerGroup>
    </>
  );
}
