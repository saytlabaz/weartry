import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import WishlistPageView from "@/components/product/WishlistPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Wishlist");
  return { title: t("title") };
}

export default function WishlistPage() {
  return <WishlistPageView />;
}
