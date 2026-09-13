import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CartPageView from "@/components/product/CartPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart");
  return { title: `${t("title")} — WearTry` };
}

export default function CartPage() {
  return <CartPageView />;
}
