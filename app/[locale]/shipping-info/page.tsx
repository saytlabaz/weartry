import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalPage from "@/components/legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal.shipping");
  return { title: t("title") };
}

export default function ShippingInfoPage() {
  return <LegalPage namespace="shipping" />;
}
