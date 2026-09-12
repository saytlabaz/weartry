"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

interface FAQItem {
  question: string;
  answer: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
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

export default function ProductFAQ() {
  const t = useTranslations("ProductFAQ");
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = t.raw("items") as FAQItem[];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]">
      <div>
        <BlurFadeUp as="h2" className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("heading")}
        </BlurFadeUp>

        <StaggerGroup className="mt-6 divide-y divide-border border-t border-b border-border">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <StaggerItem key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium"
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
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>

      <BlurFadeUp delay={0.1} className="h-fit rounded-2xl border border-border bg-muted/30 p-5 text-sm text-neutral-600">
        {t("contactLine")}
      </BlurFadeUp>
    </div>
  );
}
