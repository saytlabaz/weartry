import { useTranslations } from "next-intl";
import { seasonalDrop } from "@/lib/data";
import ProductCard from "./ProductCard";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function SeasonalDrop() {
  const t = useTranslations("Sections.seasonalDrop");

  return (
    <section className="bg-muted/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
          <div className="flex flex-col justify-center gap-5 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-8 text-white">
            <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight">
              {t("title")}
            </BlurFadeUp>
            <BlurFadeUp delay={0.1}>
              <a
                href="#best-sellers"
                className="inline-flex w-fit items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
              >
                {t("cta")}
              </a>
            </BlurFadeUp>
          </div>

          <StaggerGroup className="grid grid-cols-3 gap-4 lg:col-span-3">
            {seasonalDrop.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
