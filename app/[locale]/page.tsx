import Hero from "@/components/home/Hero";
import MarqueeTextSection from "@/components/home/MarqueeTextSection";
import NewArrivals from "@/components/home/NewArrivals";
import SeasonalDrop from "@/components/home/SeasonalDrop";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";

export default function Home() {
  return (
    <>
      <Hero />
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
