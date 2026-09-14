"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import BlurFadeUp from "@/components/motion/BlurFadeUp";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  name: string;
  items: FaqItem[];
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <StaggerItem>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground sm:text-base"
      >
        {item.question}
        <ChevronIcon open={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-neutral-500">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerItem>
  );
}

export default function FaqPageView() {
  const t = useTranslations("FaqPage");
  const [query, setQuery] = useState("");
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const categories = t.raw("categories") as FaqCategory[];

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, query]);

  const totalMatches = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <BlurFadeUp as="h1" immediate className="text-4xl font-bold tracking-tight">
        {t("title")}
      </BlurFadeUp>
      <BlurFadeUp immediate delay={0.1} className="mt-4 text-neutral-600">
        {t("intro")}
      </BlurFadeUp>

      <BlurFadeUp immediate delay={0.15} className="relative mt-8">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-full border border-border bg-background px-11 py-3 text-sm outline-none focus:border-neutral-400"
        />
      </BlurFadeUp>

      <div className="mt-10 space-y-12">
        {totalMatches === 0 ? (
          <p className="text-center text-sm text-neutral-500">{t("noResults")}</p>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.name}>
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <StaggerGroup className="mt-3 divide-y divide-border border-t border-b border-border">
                {category.items.map((item) => {
                  const key = `${category.name}__${item.question}`;
                  return (
                    <AccordionItem key={key} item={item} isOpen={openKeys.has(key)} onToggle={() => toggle(key)} />
                  );
                })}
              </StaggerGroup>
            </section>
          ))
        )}
      </div>
    </article>
  );
}
