import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  const t = useTranslations("Sections.newsletter");

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-6 py-16 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-xl">
          <BlurFadeUp as="h2" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </BlurFadeUp>
          <BlurFadeUp delay={0.1} className="mx-auto mt-3 max-w-md text-sm text-white/70">
            {t("subtitle")}
          </BlurFadeUp>
          <div className="mt-7 flex justify-center">
            <NewsletterForm />
          </div>
          <p className="mt-4 text-xs text-white/50">{t("disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
