"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { bestSellers, type Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

const FILTERS: { key: string; category: Product["category"] | "all" }[] = [
  { key: "filterAll", category: "all" },
  { key: "filterJacket", category: "jacket" },
  { key: "filterHoodie", category: "hoodie" },
  { key: "filterPants", category: "pants" },
  { key: "filterTshirt", category: "tshirt" },
];

export default function BestSellers() {
  const t = useTranslations("Sections.bestSellers");
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () => (active === "all" ? bestSellers : bestSellers.filter((p) => p.category === active)),
    [active]
  );

  return (
    <section id="best-sellers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>

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

      <div className="mt-10 text-center">
        <a href="#best-sellers" className="text-sm font-medium underline underline-offset-4">
          {t("viewMore")}
        </a>
      </div>
    </section>
  );
}
