import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { bestSellers } from "@/lib/data";
import ProductFilterGrid from "@/components/product/ProductFilterGrid";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function BestSellers() {
  const t = useTranslations("Sections.bestSellers");

  return (
    <section id="best-sellers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <ProductFilterGrid
        products={bestSellers}
        heading={
          <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </BlurFadeUp>
        }
      />

      <div className="mt-10 text-center">
        <Link href="/products" className="text-sm font-medium underline underline-offset-4">
          {t("viewMore")}
        </Link>
      </div>
    </section>
  );
}
