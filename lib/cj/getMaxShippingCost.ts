import { markets } from "@/i18n/markets";
import { getFreightQuote } from "./getFreight";

const CJ_RATE_LIMIT_SPACING_MS = 1100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MaxShippingResult {
  cost: number;
  countryCode: string;
  countryName: string;
  methodName: string;
  aging: string;
  /** Countries CJ had no 8-15 day method for, or that errored — surfaced so the admin isn't misled by a silently-partial result. */
  skipped: { countryCode: string; reason: string }[];
}

/**
 * Queries CJ's freight calculator for every supported market (i18n/markets.ts
 * — the 27 EU states + UK + US) one at a time, spaced out to stay under
 * CJ's rate limit, and returns the single most expensive 8-15 day quote
 * across all of them. Takes ~30-35s for the full 29-country sweep.
 */
export async function getMaxShippingCost(params: { vid: string; quantity?: number }): Promise<MaxShippingResult> {
  const quantity = params.quantity ?? 1;
  let best: { cost: number; countryCode: string; methodName: string; aging: string } | null = null;
  const skipped: { countryCode: string; reason: string }[] = [];

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    try {
      const quote = await getFreightQuote({ vid: params.vid, endCountryCode: market.code, quantity });
      if (!quote) {
        skipped.push({ countryCode: market.code, reason: "no_method_in_8_15_day_window" });
      } else if (!best || quote.price > best.cost) {
        best = { cost: quote.price, countryCode: market.code, methodName: quote.methodName, aging: quote.aging };
      }
    } catch (err) {
      skipped.push({ countryCode: market.code, reason: err instanceof Error ? err.message : "unknown_error" });
    }

    if (i < markets.length - 1) await sleep(CJ_RATE_LIMIT_SPACING_MS);
  }

  if (!best) {
    throw new Error("CJ returned no 8-15 day shipping method for any supported country");
  }

  const countryName = markets.find((m) => m.code === best!.countryCode)?.name ?? best.countryCode;
  return { ...best, countryName, skipped };
}
