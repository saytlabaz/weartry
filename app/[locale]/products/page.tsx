import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProductsPageView from "@/components/product/ProductsPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Sections.bestSellers");
  return { title: `${t("title")} — WearTry` };
}

export default function ProductsPage() {
  return <ProductsPageView />;
}
