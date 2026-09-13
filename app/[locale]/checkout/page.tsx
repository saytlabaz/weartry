import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeAuth } from "@/lib/auth/safe-auth";
import CheckoutPageView from "@/components/product/CheckoutPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Checkout");
  return { title: `${t("title")} — WearTry` };
}

export default async function CheckoutPage() {
  const session = await safeAuth();
  return <CheckoutPageView user={session?.user ?? null} />;
}
