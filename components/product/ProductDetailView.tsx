"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

const SIZES = ["S", "M", "L", "XL"];

export default function ProductDetailView({ product }: { product: Product }) {
  const t = useTranslations("ProductDetail");
  const tProduct = useTranslations("Product");
  const tProducts = useTranslations("Products");
  const { addToCart } = useStore();
  const [size, setSize] = useState(SIZES[1]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp>
        <Link href="/" className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900">
          {t("back")}
        </Link>
      </BlurFadeUp>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <BlurFadeUp>
          <div className={`aspect-[3/4] w-full rounded-2xl bg-gradient-to-br ${product.gradient}`} />
        </BlurFadeUp>

        <StaggerGroup className="space-y-6">
          <StaggerItem>
            {product.isNew && (
              <span className="inline-block rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {tProduct("new")}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{tProducts(product.nameKey)}</h1>
          </StaggerItem>

          <StaggerItem>
            <p className="text-xl">
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="ml-2 text-neutral-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </p>
          </StaggerItem>

          <StaggerItem>
            <div>
              <p className="mb-2 text-sm font-medium">{t("selectSize")}</p>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                      size === s
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-border text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="w-full rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto sm:px-10"
            >
              {t("addToCart")}
            </button>
          </StaggerItem>

          <StaggerItem>
            <div>
              <p className="text-sm font-semibold">{t("description")}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t("descriptionPlaceholder")}</p>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </div>
  );
}
