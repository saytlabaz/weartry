"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/locales";

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 2.6 4.2 5.7 4.2 9s-1.4 6.4-4.2 9c-2.8-2.6-4.2-5.7-4.2-9s1.4-6.4 4.2-9Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface LanguageMarketSwitcherProps {
  /**
   * "popover" (default): a floating dropdown anchored to the trigger — used
   * in the footer. "inline": expands in place instead, since it's meant to
   * live inside the mobile menu's own collapsing (overflow-hidden) panel,
   * where a floating popover would get clipped.
   */
  variant?: "popover" | "inline";
}

/**
 * Language picker: a plain globe icon that opens an animated list of
 * languages (no flags, no country/region selection — region and currency
 * now live in the checkout flow, see lib/market-context.tsx).
 */
export default function LanguageMarketSwitcher({ variant = "popover" }: LanguageMarketSwitcherProps) {
  const t = useTranslations("Market");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "popover") return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [variant]);

  function selectLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  const list = (
    <ul className="max-h-72 space-y-0.5 overflow-y-auto pr-1">
      {locales.map((l) => (
        <li key={l}>
          <button
            type="button"
            onClick={() => selectLocale(l)}
            className={`flex w-full items-center rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
              l === locale ? "bg-muted font-medium" : ""
            }`}
          >
            {localeNames[l]}
          </button>
        </li>
      ))}
    </ul>
  );

  if (variant === "inline") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <GlobeIcon />
          <span className="flex-1">{localeNames[locale]}</span>
          <ChevronIcon open={open} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pl-2"
            >
              <div className="py-1">{list}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center text-neutral-700 transition-colors hover:text-neutral-950"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("chooseLanguage")}
      >
        <GlobeIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full right-0 z-50 mb-3 w-52 origin-bottom-right rounded-xl border border-border bg-background p-2 shadow-xl"
          >
            {list}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
