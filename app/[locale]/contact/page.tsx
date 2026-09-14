import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import ContactForm from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  return { title: t("title") };
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h1" className="text-4xl font-bold tracking-tight">
        {t("title")}
      </BlurFadeUp>
      <p className="mt-4 text-neutral-600">{t("intro")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-5">
          <p className="text-sm font-medium text-neutral-500">{t("emailLabel")}</p>
          <p className="mt-1 text-neutral-900">{t("email")}</p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-border p-5">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-sm font-medium text-neutral-500">{t("hoursLabel")}</p>
            <p className="mt-1 text-neutral-900">{t("hours")}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ContactForm />
      </div>
    </article>
  );
}
