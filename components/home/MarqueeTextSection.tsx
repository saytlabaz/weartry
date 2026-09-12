import { useTranslations } from "next-intl";
import Marquee from "@/components/motion/Marquee";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function MarqueeTextSection() {
  const t = useTranslations("MarqueeText");

  return (
    <BlurFadeUp as="div" duration={0.6} offset={20}>
      <section className="border-y border-border bg-background py-8">
        <Marquee duration={26}>
          <div className="flex items-center gap-10 text-3xl font-bold uppercase tracking-tight text-neutral-900 sm:text-5xl">
            <span>{t("phrase1")}</span>
            <span aria-hidden className="text-neutral-300">✳</span>
            <span>{t("phrase2")}</span>
            <span aria-hidden className="text-neutral-300">✳</span>
          </div>
        </Marquee>
      </section>
    </BlurFadeUp>
  );
}
