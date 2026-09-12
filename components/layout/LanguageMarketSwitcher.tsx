"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/locales";
import { markets, defaultMarket, getMarket, type MarketCode } from "@/i18n/markets";

const MARKET_COOKIE = "weartry_market";

function persistMarket(code: MarketCode) {
  document.cookie = `${MARKET_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export default function LanguageMarketSwitcher() {
  const t = useTranslations("Market");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"language" | "country">("country");
  const [market, setMarket] = useState<MarketCode>(() => {
    if (typeof document === "undefined") return defaultMarket;
    const stored = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${MARKET_COOKIE}=`))
      ?.split("=")[1];
    return (stored as MarketCode) ?? defaultMarket;
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectMarket(code: MarketCode) {
    persistMarket(code);
    setMarket(code);
  }

  function selectLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  const activeMarket = getMarket(market);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-lg leading-none"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("region")}
      >
        <span>{activeMarket.flag}</span>
        <span className="text-xs font-medium tracking-wide text-neutral-500">
          {localeNames[locale]?.slice(0, 2).toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-border bg-background p-4 shadow-xl">
          <div className="mb-3 flex gap-1 rounded-lg bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab("country")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                tab === "country" ? "bg-background shadow-sm" : "text-neutral-500"
              }`}
            >
              {t("chooseCountry")}
            </button>
            <button
              type="button"
              onClick={() => setTab("language")}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                tab === "language" ? "bg-background shadow-sm" : "text-neutral-500"
              }`}
            >
              {t("chooseLanguage")}
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1">
            {tab === "country" ? (
              <ul className="space-y-0.5">
                {markets.map((m) => (
                  <li key={m.code}>
                    <button
                      type="button"
                      onClick={() => selectMarket(m.code)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                        m.code === market ? "bg-muted font-medium" : ""
                      }`}
                    >
                      <span className="text-base leading-none">{m.flag}</span>
                      <span className="flex-1">{m.name}</span>
                      <span className="text-xs text-neutral-400">{m.currency}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-0.5">
                {locales.map((l) => (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => selectLocale(l)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                        l === locale ? "bg-muted font-medium" : ""
                      }`}
                    >
                      <span className="text-base leading-none">{localeFlags[l]}</span>
                      <span>{localeNames[l]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-3 border-t border-border pt-3 text-xs text-neutral-500">
            {t("shippingTo", { country: activeMarket.name })} · {activeMarket.currencySymbol} {activeMarket.currency}
          </p>
        </div>
      )}
    </div>
  );
}
