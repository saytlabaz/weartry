"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-[640px] items-end overflow-hidden bg-gradient-to-br from-sky-200 via-sky-100 to-orange-100 sm:min-h-[720px]">
      {/* Placeholder hero backdrop — replace with campaign photography */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-14 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700"
        >
          {t("eyebrow")}
        </motion.p>

        <BlurFadeUp
          as="h1"
          duration={1.1}
          offset={30}
          className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-7xl"
        >
          {t("title")}
        </BlurFadeUp>

        <BlurFadeUp delay={0.15} className="max-w-md text-base text-neutral-700 sm:text-lg">
          {t("subtitle")}
        </BlurFadeUp>

        <BlurFadeUp delay={0.3}>
          <a
            href="#new-arrivals"
            className="inline-flex items-center rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {t("cta")}
          </a>
        </BlurFadeUp>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 right-4 z-10 hidden items-center gap-3 rounded-2xl bg-white/90 p-3 pr-5 shadow-lg backdrop-blur sm:right-8 sm:flex"
      >
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900" />
        <div>
          <p className="text-sm font-semibold">{t("badgeTitle")}</p>
          <a href="#new-arrivals" className="text-xs text-neutral-500 underline underline-offset-2">
            {t("badgeCta")}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
