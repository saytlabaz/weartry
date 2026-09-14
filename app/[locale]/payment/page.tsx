import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PaymentPageView from "@/components/product/PaymentPageView";
import { getShippingConfig } from "@/lib/shipping/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: `${t("paymentHeading")} — WearTry` };
}

export default async function PaymentPage() {
  const shippingConfig = await getShippingConfig();
  return <PaymentPageView shippingConfig={shippingConfig} />;
}
