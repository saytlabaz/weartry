"use client";

import { useTranslations } from "next-intl";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import ProductCard from "@/components/home/ProductCard";

export default function WishlistPageView() {
  const t = useTranslations("Wishlist");
  const { wishlistIds } = useStore();
  const items = wishlistIds.map(findProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp as="h1" className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </BlurFadeUp>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">{t("empty")}</p>
      ) : (
        <StaggerGroup className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
