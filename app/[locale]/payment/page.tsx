import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PaymentPageView from "@/components/product/PaymentPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: `${t("paymentHeading")} — WearTry` };
}

export default function PaymentPage() {
  return <PaymentPageView />;
}
