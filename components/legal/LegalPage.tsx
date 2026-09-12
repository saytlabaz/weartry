import { useLocale, useTranslations, useFormatter } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

interface Section {
  heading: string;
  body: string;
}

const FULLY_TRANSLATED_LOCALES = new Set(["en", "az"]);

export default function LegalPage({
  namespace,
}: {
  namespace: "privacy" | "terms" | "returns" | "cookies" | "shipping";
}) {
  const t = useTranslations(`Legal.${namespace}`);
  const tLegal = useTranslations("Legal");
  const format = useFormatter();
  const locale = useLocale();

  const sections = t.raw("sections") as Section[];
  const today = format.dateTime(new Date(), { year: "numeric", month: "long", day: "numeric" });
  const isFallback = !FULLY_TRANSLATED_LOCALES.has(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h1" className="text-4xl font-bold tracking-tight">
        {t("title")}
      </BlurFadeUp>
      <p className="mt-3 text-sm text-neutral-500">{tLegal("lastUpdated", { date: today })}</p>
      {isFallback && (
        <p className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-neutral-600">
          {tLegal("fallbackNotice")}
        </p>
      )}
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
