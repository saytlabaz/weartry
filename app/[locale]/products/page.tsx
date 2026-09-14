import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProductsPageView from "@/components/product/ProductsPageView";
import { getActiveDbProducts } from "@/lib/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Sections.bestSellers");
  return { title: `${t("title")} — WearTry` };
}

export default async function ProductsPage() {
  const dbProducts = await getActiveDbProducts();
  return <ProductsPageView dbProducts={dbProducts} />;
}
