import { useTranslations } from "next-intl";
import { newArrivals } from "@/lib/data";
import ProductCard from "./ProductCard";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function NewArrivals() {
  const t = useTranslations("Sections.newArrivals");

  return (
    <section id="new-arrivals" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 flex items-end justify-between">
        <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>
        <a href="#best-sellers" className="hidden text-sm font-medium underline underline-offset-4 sm:block">
          {t("viewMore")}
        </a>
      </div>

      <StaggerGroup className="grid grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-6 sm:gap-y-8">
        {newArrivals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </StaggerGroup>
    </section>
  );
}
