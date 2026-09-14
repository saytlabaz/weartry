import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { findProductsByAudience, type Product } from "@/lib/data";
import { getActiveDbProducts } from "@/lib/catalog";
import CategoryPageView from "@/components/product/CategoryPageView";

const AUDIENCES: Product["audience"][] = ["men", "women", "kids"];

export function generateStaticParams() {
  return AUDIENCES.map((slug) => ({ slug }));
}

function isAudience(slug: string): slug is Product["audience"] {
  return (AUDIENCES as string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isAudience(slug)) return {};

  const t = await getTranslations("Nav");
  return { title: `${t(slug)} — WearTry` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!isAudience(slug)) {
    notFound();
  }

  const staticProducts = findProductsByAudience(slug);
  const dbProducts = (await getActiveDbProducts()).filter((p) => p.audience === slug);
  const products = [...dbProducts, ...staticProducts];

  return <CategoryPageView audience={slug} products={products} />;
}
