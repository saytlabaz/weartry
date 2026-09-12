import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPage from "@/components/legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal.terms");
  return { title: t("title") };
}

export default function TermsOfServicePage() {
  return <LegalPage namespace="terms" />;
}
