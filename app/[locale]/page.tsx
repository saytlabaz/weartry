import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import Hero from "@/components/home/Hero";
import MarqueeTextSection from "@/components/home/MarqueeTextSection";
import NewArrivals from "@/components/home/NewArrivals";
import SeasonalDrop from "@/components/home/SeasonalDrop";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";

// Admin-managed (DB-backed) hero copy, "az" locale only — see
// /idarepaneli/sehifeler. Every other locale keeps reading next-intl's
// translation directly inside Hero.
async function getHeroOverrides(locale: string) {
  if (locale !== "az") return undefined;
  const rows = await dbSafe(() => prisma.siteContent.findMany({ where: { locale: "az" } }), []);
  if (rows.length === 0) return undefined;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const heroOverrides = await getHeroOverrides(locale);

  return (
    <>
      <Hero overrides={heroOverrides} />
      <FeaturedProducts />
      <NewArrivals />
      <MarqueeTextSection />
      <SeasonalDrop />
      <Categories />
      <BestSellers />
      <Features />
      <Testimonials />
      <FAQSection />
    </>
  );
}
