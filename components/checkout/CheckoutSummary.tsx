"use client";

import { useTranslations } from "next-intl";
import { useMarket } from "@/lib/market-context";

/**
 * Structural placeholder for the future checkout flow: this is where a
 * shopper picks/confirms their country and currency (auto-detected on first
 * visit via middleware.ts, stored in the weartry_market cookie, and exposed
 * through MarketProvider/useMarket) rather than in the header.
 */
export default function CheckoutSummary() {
  const t = useTranslations("CheckoutSummary");
  const { market, marketCode, setMarketCode, markets } = useMarket();

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="mt-4">
        <label htmlFor="checkout-region" className="mb-1.5 block text-sm font-medium text-neutral-700">
          {t("selectRegion")}
        </label>
        <select
          id="checkout-region"
          value={marketCode}
          onChange={(e) => setMarketCode(e.target.value as typeof marketCode)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-neutral-400"
        >
          {markets.map((m) => (
            <option key={m.code} value={m.code}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        {t("currency")}: {market.currencySymbol} {market.currency}
      </p>
    </div>
  );
}
