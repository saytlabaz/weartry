"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { markets, defaultMarket, getMarket, type MarketCode } from "@/i18n/markets";
import { createPersistedCookieValue } from "@/lib/persisted-store";

const marketStore = createPersistedCookieValue<MarketCode>("weartry_market", defaultMarket);

interface MarketContextValue {
  marketCode: MarketCode;
  market: ReturnType<typeof getMarket>;
  setMarketCode: (code: MarketCode) => void;
  markets: typeof markets;
}

const MarketContext = createContext<MarketContextValue | null>(null);

/**
 * Region/currency now lives here rather than as a standalone header control.
 * Country is auto-detected server-side (see middleware.ts, which reads
 * x-vercel-ip-country and seeds the weartry_market cookie on first visit) —
 * this context just exposes that choice to whichever part of the checkout
 * flow needs to let the shopper override it.
 */
export function MarketProvider({ children }: { children: ReactNode }) {
  const marketCode = useSyncExternalStore(
    marketStore.subscribe,
    marketStore.getSnapshot,
    marketStore.getServerSnapshot
  );

  return (
    <MarketContext.Provider
      value={{ marketCode, market: getMarket(marketCode), setMarketCode: marketStore.set, markets }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within a MarketProvider");
  return ctx;
}

// TODO: real currency conversion — prices in lib/data.ts are static placeholders
// in USD; convert against `market.currency` once live FX rates are wired up.
