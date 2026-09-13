import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CheckoutPageView from "@/components/product/CheckoutPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: `${t("title")} — WearTry` };
}

export default function CheckoutPage() {
  return <CheckoutPageView />;
}
