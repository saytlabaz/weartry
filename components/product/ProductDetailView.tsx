"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/data";
import { testimonials } from "@/lib/data";
import { pseudoRandom } from "@/lib/pseudo-random";
import { useStore } from "@/lib/store-context";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { PAYMENT_ICONS } from "@/components/layout/PaymentIcons";
import ProductGallery from "./ProductGallery";
import StarRating from "./StarRating";
import ProductAccordion from "./ProductAccordion";
import ProductReviews from "./ProductReviews";
import RelatedProducts from "./RelatedProducts";
import ProductFAQ from "./ProductFAQ";
import TrustBadges from "./TrustBadges";

const SIZES = ["S", "M", "L", "XL"];
const LOW_STOCK_THRESHOLD = 8;

export default function ProductDetailView({ product }: { product: Product }) {
  const t = useTranslations("ProductDetail");
  const tProduct = useTranslations("Product");
  const tProducts = useTranslations("Products");
  const { addToCart } = useStore();
  const [size, setSize] = useState(SIZES[1]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [buyNowClicked, setBuyNowClicked] = useState(false);

  const reviewCount = pseudoRandom(product.id, 60, 940);
  const rating = 4 + (pseudoRandom(product.id + "rating", 0, 10) >= 5 ? 0.5 : 0);
  const stock = pseudoRandom(product.id + "stock", 2, 30);
  const quote = testimonials[pseudoRandom(product.id + "quote", 0, testimonials.length)];

  const accordionItems = [
    { title: t("detailsTitle"), content: t("detailsContent") },
    { title: t("shippingTitle"), content: t("shippingContent") },
    { title: t("returnsTitle"), content: t("returnsContent") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp>
        <Link href="/" className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900">
          {t("back")}
        </Link>
      </BlurFadeUp>

      {/* a) Gallery + main info */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <BlurFadeUp>
          <ProductGallery gradient={product.gradient} />
        </BlurFadeUp>

        <StaggerGroup className="space-y-5">
          <StaggerItem>
            {product.isNew && (
              <span className="inline-block rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {tProduct("new")}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-bold tracking-tight">{tProducts(product.nameKey)}</h1>
          </StaggerItem>

          <StaggerItem>
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-sm text-neutral-500">{t("ratingsCount", { count: reviewCount })}</span>
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="text-xl">
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="ml-2 text-neutral-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </p>
          </StaggerItem>

          {stock <= LOW_STOCK_THRESHOLD && (
            <StaggerItem>
              <p className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                {t("lowStockWarning", { count: stock })}
              </p>
            </StaggerItem>
          )}

          <StaggerItem>
            <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-neutral-600">{t("trustBadge")}</p>
          </StaggerItem>

          <StaggerItem>
            <p className="text-sm leading-relaxed text-neutral-600">{t("descriptionPlaceholder")}</p>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-1.5">
                <StarRating rating={quote.rating} size={12} />
              </div>
              <p className="mt-2 text-sm italic leading-relaxed text-neutral-600">&ldquo;{quote.quote}&rdquo;</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <span aria-hidden>{quote.flag}</span>
                {quote.name}
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <p className="mb-2 text-sm font-medium">{t("colorLabel")}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={c}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition-shadow ${
                      color === c ? "ring-neutral-900" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <label htmlFor="pdp-size" className="mb-2 block text-sm font-medium">
                {t("selectSize")}
              </label>
              <select
                id="pdp-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full max-w-[160px] rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div>
              <p className="mb-2 text-sm font-medium">{t("quantityLabel")}</p>
              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="-"
                  className="flex h-9 w-9 items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="+"
                  className="flex h-9 w-9 items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
                className="flex-1 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                {t("addToCart")}
              </button>
              <button
                type="button"
                onClick={() => setBuyNowClicked(true)}
                className="flex-1 rounded-full border border-neutral-900 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-neutral-900 hover:text-white"
              >
                {t("buyNow")}
              </button>
            </div>
            {buyNowClicked && <p className="mt-2 text-xs text-neutral-500">{t("buyNowPlaceholder")}</p>}
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
              {PAYMENT_ICONS.map((Icon, i) => (
                <span key={i} className="flex h-6 items-center justify-center p-1">
                  <Icon />
                </span>
              ))}
            </div>
          </StaggerItem>
        </StaggerGroup>
      </div>

      {/* b) Details / Shipping / Returns accordion */}
      <BlurFadeUp className="mt-16">
        <ProductAccordion items={accordionItems} />
      </BlurFadeUp>

      {/* c) Reviews */}
      <div className="mt-16">
        <ProductReviews />
      </div>

      {/* d) Related products */}
      <div className="mt-16">
        <RelatedProducts product={product} />
      </div>

      {/* e) Product FAQ + contact */}
      <div className="mt-16">
        <ProductFAQ />
      </div>

      {/* f) Trust badges */}
      <div className="mt-16">
        <TrustBadges />
      </div>
    </div>
  );
}
