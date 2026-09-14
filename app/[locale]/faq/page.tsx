import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FaqPageView from "@/components/legal/FaqPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FaqPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function FaqPage() {
  return <FaqPageView />;
}
