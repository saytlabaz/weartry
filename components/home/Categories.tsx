import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import FloatingBlobs from "@/components/motion/FloatingBlobs";

export default function Categories() {
  const t = useTranslations("Sections.categories");

  const cards = [
    { label: t("menLabel"), title: t("menTitle"), gradient: "from-slate-700 to-slate-900" },
    { label: t("womenLabel"), title: t("womenTitle"), gradient: "from-rose-300 to-rose-500" },
    { label: t("kidsLabel"), title: t("kidsTitle"), gradient: "from-amber-300 to-orange-400" },
  ];

  return (
    <section id="categories" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <FloatingBlobs className="-z-10 opacity-60" />
      <BlurFadeUp as="h2" className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </BlurFadeUp>

      <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <StaggerItem key={c.label}>
            <div
              className={`group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-6 text-white`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{c.label}</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight">{c.title}</h3>
              <a
                href="#best-sellers"
                className="mt-4 inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-900 transition-transform group-hover:scale-105"
              >
                {t("cta")}
              </a>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
