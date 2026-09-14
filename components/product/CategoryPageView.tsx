"use client";

import { useTranslations } from "next-intl";
import type { Product } from "@/lib/data";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import ProductCard from "@/components/home/ProductCard";

const TITLE_KEY: Record<Product["audience"], "menTitle" | "womenTitle" | "kidsTitle"> = {
  men: "menTitle",
  women: "womenTitle",
  kids: "kidsTitle",
};

const NAV_KEY: Record<Product["audience"], "men" | "women" | "kids"> = {
  men: "men",
  women: "women",
  kids: "kids",
};

export default function CategoryPageView({
  audience,
  products,
}: {
  audience: Product["audience"];
  products: Product[];
}) {
  const t = useTranslations("Sections.categories");
  const tNav = useTranslations("Nav");
  const tCategory = useTranslations("Category");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp as="h1" immediate className="text-3xl font-bold tracking-tight sm:text-4xl">
        {tNav(NAV_KEY[audience])}
      </BlurFadeUp>
      <BlurFadeUp delay={0.1} className="mt-2 text-neutral-500">
        {t(TITLE_KEY[audience])}
      </BlurFadeUp>

      <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
        <span className="text-sm text-neutral-500">
          {products.length} {tCategory("itemsLabel")}
        </span>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-neutral-600"
        >
          {tCategory("sortPlaceholder")}
        </button>
      </div>

      <StaggerGroup className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </StaggerGroup>
    </div>
  );
}
