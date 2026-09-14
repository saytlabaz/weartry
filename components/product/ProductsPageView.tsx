"use client";

import { useTranslations } from "next-intl";
import { bestSellers, type Product } from "@/lib/data";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import ProductFilterGrid from "@/components/product/ProductFilterGrid";

export default function ProductsPageView({ dbProducts = [] }: { dbProducts?: Product[] }) {
  const t = useTranslations("Sections.bestSellers");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <ProductFilterGrid
        products={[...dbProducts, ...bestSellers]}
        heading={
          <BlurFadeUp as="h1" immediate className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </BlurFadeUp>
        }
      />
    </div>
  );
}
