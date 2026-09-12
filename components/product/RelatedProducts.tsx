"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { allProducts, type Product } from "@/lib/data";
import { useStore } from "@/lib/store-context";
import { pseudoRandom } from "@/lib/pseudo-random";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import StarRating from "./StarRating";

function findRelated(current: Product): Product[] {
  const sameCategory = allProducts.filter((p) => p.id !== current.id && p.category === current.category);
  const sameAudience = allProducts.filter(
    (p) => p.id !== current.id && p.audience === current.audience && !sameCategory.includes(p)
  );
  const rest = allProducts.filter(
    (p) => p.id !== current.id && !sameCategory.includes(p) && !sameAudience.includes(p)
  );
  return [...sameCategory, ...sameAudience, ...rest].slice(0, 4);
}

export default function RelatedProducts({ product }: { product: Product }) {
  const t = useTranslations("ProductDetail");
  const tProducts = useTranslations("Products");
  const { addToCart } = useStore();
  const related = findRelated(product);

  if (related.length === 0) return null;

  return (
    <div>
      <BlurFadeUp as="h2" className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("relatedHeading")}
      </BlurFadeUp>

      <StaggerGroup className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
        {related.map((p) => {
          const reviewCount = pseudoRandom(p.id, 40, 620);
          const sold = pseudoRandom(p.id + "sold", 80, 900);
          const available = pseudoRandom(p.id + "avail", 3, 40);
          return (
            <StaggerItem key={p.id}>
              <Link href={`/products/${p.slug}`} className="block">
                <div className={`aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br ${p.gradient}`} />
                <p className="mt-3 truncate text-sm font-medium">{tProducts(p.nameKey)}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StarRating rating={4.5} size={11} />
                  <span className="text-xs text-neutral-400">({reviewCount})</span>
                </div>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">${p.price.toFixed(2)}</span>
                  {p.compareAtPrice && (
                    <span className="ml-1.5 text-neutral-400 line-through">${p.compareAtPrice.toFixed(2)}</span>
                  )}
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {t("sold", { count: sold })} · {t("available", { count: available })}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => addToCart(p)}
                className="mt-2 w-full rounded-full border border-neutral-900 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-900 hover:text-white"
              >
                {t("addToCart")}
              </button>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
