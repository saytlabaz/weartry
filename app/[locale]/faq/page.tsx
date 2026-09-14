import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import FaqPageView from "@/components/legal/FaqPageView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FaqPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

// The admin panel only manages "az" FaqItem rows (no locale switcher —
// see /idarepaneli/faq); every other locale keeps reading straight from
// next-intl's message files inside FaqPageView, unaffected by this.
async function getAdminManagedCategories(locale: string) {
  if (locale !== "az") return undefined;

  const items = await dbSafe(
    () =>
      prisma.faqItem.findMany({
        where: { locale: "az", isActive: true },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
    []
  );
  if (items.length === 0) return undefined;

  const grouped = new Map<string, { question: string; answer: string }[]>();
  for (const item of items) {
    grouped.set(item.category, [...(grouped.get(item.category) ?? []), { question: item.question, answer: item.answer }]);
  }
  return Array.from(grouped.entries()).map(([name, categoryItems]) => ({ name, items: categoryItems }));
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const categories = await getAdminManagedCategories(locale);

  return <FaqPageView categories={categories} />;
}
