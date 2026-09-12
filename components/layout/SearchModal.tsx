"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { allProducts } from "@/lib/data";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

// TODO: swap this client-side filter for a real backend/search API once the catalogue is dynamic.
export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Search");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");
  const tProducts = useTranslations("Products");
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter(
      (p) =>
        tProducts(p.nameKey).toLowerCase().includes(q) ||
        p.audience.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query, tProducts]);

  const popular = useMemo(() => allProducts.slice(0, 4), []);

  function handleClose() {
    setQuery("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={handleClose}
            aria-hidden
          />
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="fixed left-1/2 top-20 z-[61] w-[92vw] max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-background p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tNav("searchPlaceholder")}
                className="w-full flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
              />
              <button
                type="button"
                onClick={handleClose}
                aria-label={tCommon("close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {query.trim() === "" ? (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {t("popularSearches")}
                  </p>
                  <ResultsList products={popular} onNavigate={handleClose} />
                </>
              ) : results.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">{t("noResults")}</p>
              ) : (
                <ResultsList products={results} onNavigate={handleClose} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ResultsList({
  products,
  onNavigate,
}: {
  products: (typeof allProducts)[number][];
  onNavigate: () => void;
}) {
  const tProducts = useTranslations("Products");
  return (
    <ul className="space-y-1">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/products/${product.slug}`}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
          >
            <span className={`h-12 w-10 shrink-0 rounded-lg bg-gradient-to-br ${product.gradient}`} />
            <span className="flex-1 text-sm font-medium">{tProducts(product.nameKey)}</span>
            <span className="text-sm text-neutral-500">${product.price.toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
