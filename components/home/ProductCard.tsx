"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import { StaggerItem } from "@/components/motion/StaggerGroup";

function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tProductDetail = useTranslations("ProductDetail");
  const { addToWishlist, addToCart } = useStore();
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <StaggerItem className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br ${product.gradient}`}>
          {/* Placeholder swatch — replace with real product photography */}
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-wide text-black/30">
            {product.name}
          </div>

          <div className="absolute left-3 top-3 flex gap-1.5">
            {discount && (
              <span className="rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-neutral-900">
                {t("new")}
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              aria-label={t("addToWishlist")}
              onClick={(e) => {
                e.preventDefault();
                addToWishlist(product);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 transition-transform hover:scale-110"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2.2 4.5 5.8 4c2-.3 3.7.7 6.2 3 2.5-2.3 4.2-3.3 6.2-3 3.6.5 5.1 4 3.3 7.5C19 15.65 12 20 12 20Z" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={tProductDetail("addToCart")}
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 transition-transform hover:scale-110"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 6Z" strokeLinejoin="round" />
                <path d="M8 6V5a4 4 0 0 1 8 0v1" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="ml-2 text-neutral-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          <div className="mt-1 flex shrink-0 gap-1">
            {product.colors.map((c) => (
              <span
                key={c}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </Link>
    </StaggerItem>
  );
}
