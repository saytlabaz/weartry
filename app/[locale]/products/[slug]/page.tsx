import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { allProducts, findProductBySlug } from "@/lib/data";
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
  const product = findProductBySlug(slug);
  if (!product) return {};

  const t = await getTranslations("Meta");
  const tProducts = await getTranslations("Products");
  return {
    title: `${tProducts(product.nameKey)} — WearTry`,
    description: t("description"),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
