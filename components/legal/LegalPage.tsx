import { useTranslations, useFormatter } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

interface Section {
  heading: string;
  body: string;
}

export default function LegalPage({ namespace }: { namespace: "privacy" | "terms" | "returns" | "cookies" }) {
  const t = useTranslations(`Legal.${namespace}`);
  const tLegal = useTranslations("Legal");
  const format = useFormatter();

  const sections = t.raw("sections") as Section[];
  const today = format.dateTime(new Date(), { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h1" className="text-4xl font-bold tracking-tight">
        {t("title")}
      </BlurFadeUp>
      <p className="mt-3 text-sm text-neutral-500">{tLegal("lastUpdated", { date: today })}</p>
      <p className="mt-6 text-neutral-700">{t("intro")}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="mt-2 leading-relaxed text-neutral-600">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
