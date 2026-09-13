"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CartPageView() {
  const t = useTranslations("Cart");
  const tProducts = useTranslations("Products");
  const { cartItems, updateCartQuantity, removeFromCart } = useStore();

  const items = cartItems
    .map((entry) => {
      const product = findProductById(entry.id);
      return product ? { product, quantity: entry.quantity } : null;
    })
    .filter((item): item is { product: NonNullable<ReturnType<typeof findProductById>>; quantity: number } =>
      Boolean(item)
    );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <BlurFadeUp as="h1" className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </BlurFadeUp>

      {items.length === 0 ? (
        <BlurFadeUp delay={0.05} className="mt-6 text-sm text-neutral-500">
          {t("empty")}
        </BlurFadeUp>
      ) : (
        <>
          <StaggerGroup className="mt-10 divide-y divide-border border-t border-b border-border">
            {items.map(({ product, quantity }) => (
              <StaggerItem key={product.id}>
                <div className="flex items-center gap-4 py-5">
                  <Link
                    href={`/products/${product.slug}`}
                    className={`h-24 w-20 shrink-0 rounded-xl bg-gradient-to-br ${product.gradient}`}
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline">
                      {tProducts(product.nameKey)}
                    </Link>
                    <p className="mt-1 text-sm text-neutral-500">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      aria-label="-"
                      className="flex h-9 w-9 items-center justify-center text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(product.id, quantity + 1)}
                      aria-label="+"
                      className="flex h-9 w-9 items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-20 shrink-0 text-right text-sm font-semibold">
                    ${(product.price * quantity).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={t("remove")}
                    className="shrink-0 text-neutral-400 hover:text-neutral-700"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <BlurFadeUp className="mt-8 flex flex-col items-end gap-4">
            <div className="flex items-center gap-4 text-lg font-semibold">
              <span>{t("subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full rounded-full bg-neutral-900 px-8 py-3.5 text-center text-sm font-semibold text-white sm:w-auto"
            >
              {t("checkoutButton")}
            </Link>
          </BlurFadeUp>
        </>
      )}
    </div>
  );
}
