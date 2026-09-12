"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { findProductById } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import SidePanel from "./SidePanel";

export default function WishlistDrawer() {
  const t = useTranslations("Wishlist");
  const { wishlistIds, isWishlistOpen, closeWishlist, removeFromWishlist } = useStore();
  const items = wishlistIds.map(findProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <SidePanel open={isWishlistOpen} onClose={closeWishlist} title={t("title")}>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("empty")}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((product) => (
            <li key={product.id} className="flex gap-3">
              <Link
                href={`/products/${product.slug}`}
                onClick={closeWishlist}
                className={`h-20 w-16 shrink-0 rounded-lg bg-gradient-to-br ${product.gradient}`}
              />
              <div className="flex flex-1 items-start justify-between gap-2">
                <div>
                  <Link href={`/products/${product.slug}`} onClick={closeWishlist} className="text-sm font-medium hover:underline">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-neutral-500">${product.price.toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SidePanel>
  );
}
