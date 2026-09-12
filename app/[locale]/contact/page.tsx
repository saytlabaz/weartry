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
        <div className="rounded-2xl border border-border p-5">
          <p className="text-sm font-medium text-neutral-500">{t("hoursLabel")}</p>
          <p className="mt-1 text-neutral-900">{t("hours")}</p>
        </div>
      </div>

      <div className="mt-12">
        <ContactForm />
      </div>
    </article>
  );
}
