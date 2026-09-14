import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { allProducts, findProductBySlug } from "@/lib/data";
import { getActiveDbProductBySlug } from "@/lib/catalog";
import ProductDetailView from "@/components/product/ProductDetailView";

export function generateStaticParams() {
  const uniqueSlugs = Array.from(new Set(allProducts.map((p) => p.slug)));
  return uniqueSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug) ?? (await getActiveDbProductBySlug(slug));
  if (!product) return {};

  const t = await getTranslations("Meta");
  const tProducts = await getTranslations("Products");
  return {
    title: `${product.isDbProduct ? product.name : tProducts(product.nameKey)} — WearTry`,
    description: t("description"),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // DB lookup only runs when the static catalogue doesn't have this slug —
  // that's every request for a static product, unchanged from before.
  const product = findProductBySlug(slug) ?? (await getActiveDbProductBySlug(slug));

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
