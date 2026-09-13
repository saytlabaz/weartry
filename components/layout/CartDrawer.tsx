"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import SidePanel from "./SidePanel";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const tProducts = useTranslations("Products");
  const { cartItems, isCartOpen, closeCart, updateCartQuantity, removeFromCart } = useStore();

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
    <SidePanel open={isCartOpen} onClose={closeCart} title={t("title")}>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("empty")}</p>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 space-y-4">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={closeCart}
                  className={`h-20 w-16 shrink-0 rounded-lg bg-gradient-to-br ${product.gradient}`}
                />
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium hover:underline"
                    >
                      {tProducts(product.nameKey)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      aria-label={t("remove")}
                      className="shrink-0 text-neutral-400 hover:text-neutral-700"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        aria-label="-"
                        className="flex h-7 w-7 items-center justify-center text-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        aria-label="+"
                        className="flex h-7 w-7 items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-medium">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{t("subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full rounded-full border border-neutral-900 px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white"
              >
                {t("viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full rounded-full bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white"
              >
                {t("buyNow")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}
