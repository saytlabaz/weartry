"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";

interface FAQItem {
  question: string;
  answer: string;
}

const FULLY_TRANSLATED_LOCALES = new Set(["en", "az"]);

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FAQSection() {
  const t = useTranslations("FAQ");
  const tLegal = useTranslations("Legal");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = t.raw("items") as FAQItem[];
  const isFallback = !FULLY_TRANSLATED_LOCALES.has(locale);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl">
        <BlurFadeUp as="h2" className="text-left text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </BlurFadeUp>

        {isFallback && (
          <p className="mt-4 max-w-md rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-neutral-600">
            {tLegal("fallbackNotice")}
          </p>
        )}

        <div className="mt-10 divide-y divide-border border-t border-b border-border">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground sm:text-base"
                >
                  {item.question}
                  <ChevronIcon open={open} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-sm leading-relaxed text-neutral-500">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
