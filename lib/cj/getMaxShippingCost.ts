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
  /**
   * Countries with no standard method in the target day window (excluded
   * entirely, not substituted with an express/out-of-window fallback), or
   * that errored — surfaced so the admin isn't misled by a silently-partial
   * result.
   */
  skipped: { countryCode: string; reason: string }[];
}

/**
 * "Max of Mins" algorithm — returns the worst-case standard shipping cost
 * across all target markets (27 EU states + UK + US from i18n/markets.ts).
 *
 * For each target country (Addım A):
 *   - getFreightQuote() calls CJ's freight calculator and returns the
 *     CHEAPEST non-premium method whose delivery window falls within the
 *     acceptable range (premium carriers such as DHL, FedEx, UPS, EMS are
 *     excluded unless they are the only option). This is the per-country
 *     minimum.
 *
 * Across all countries (Addım B):
 *   - We take the MAXIMUM of those per-country minimums. This gives the
 *     single price that would cover standard shipping to every supported
 *     market, without being inflated by express carrier quotes.
 *
 * The result is stored in `cjMaxShippingCost` / `cjMaxShippingCountry`
 * on the Product row (see prisma/schema.prisma) — a pricing reference only;
 * nothing reads it to directly charge customers.
 *
 * Function name and return type are kept unchanged so all existing
 * call-sites and the DB column continue to compile without modification.
 */
export async function getMaxShippingCost(params: { vid: string; quantity?: number }): Promise<MaxShippingResult> {
  const quantity = params.quantity ?? 1;

  // Target markets: all EU members + GB + US — derived from the existing
  // euMember flag in i18n/markets.ts; no new configuration needed.
  const targetMarkets = markets.filter((m) => m.euMember || m.code === "GB" || m.code === "US");

  // best = the highest per-country minimum seen so far (Addım B accumulator).
  let best: { cost: number; countryCode: string; methodName: string; aging: string } | null = null;
  const skipped: { countryCode: string; reason: string }[] = [];

  for (let i = 0; i < targetMarkets.length; i++) {
    const market = targetMarkets[i];
    try {
      // Addım A: getFreightQuote already returns the cheapest non-premium
      // method in the acceptable day window for this country.
      const quote = await getFreightQuote({ vid: params.vid, endCountryCode: market.code, quantity });
      if (!quote) {
        skipped.push({ countryCode: market.code, reason: "no_method_in_window" });
      } else if (!best || quote.price > best.cost) {
        // Addım B: keep the highest of the per-country minimums.
        best = { cost: quote.price, countryCode: market.code, methodName: quote.methodName, aging: quote.aging };
      }
    } catch (err) {
      skipped.push({ countryCode: market.code, reason: err instanceof Error ? err.message : "unknown_error" });
    }

    if (i < targetMarkets.length - 1) await sleep(CJ_RATE_LIMIT_SPACING_MS);
  }

  if (!best) {
    throw new Error("CJ has no standard shipping method in the target day window for any supported market (EU + GB + US)");
  }

  const countryName = markets.find((m) => m.code === best!.countryCode)?.name ?? best.countryCode;
  return { ...best, countryName, skipped };
}
