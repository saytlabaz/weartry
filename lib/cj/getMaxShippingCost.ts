import { markets } from "@/i18n/markets";
import { getFreightQuote } from "./getFreight";

/**
 * The exact 29 target markets for the Max-of-Mins sweep, expressed as
 * ISO-3166-1 alpha-2 codes. Using an explicit allowlist (rather than
 * `euMember || GB || US`) makes the set stable and auditable — adding a
 * new market to i18n/markets.ts won't silently expand the sweep.
 */
const TARGET_COUNTRY_CODES = new Set([
  "US", "GB",
  // 27 EU member states
  "AT", "BE", "BG", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HR", "HU", "IE", "IT", "CY", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

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
   * Countries with no eligible method (max delivery day > 15, or no method
   * returned by CJ), or that errored — recorded so the admin can see which
   * markets were excluded from the calculation.
   */
  skipped: { countryCode: string; reason: string }[];
}

/**
 * "Max of Mins" algorithm — returns the worst-case standard shipping cost
 * across exactly 29 target markets (US, GB, 27 EU states).
 *
 * Addım A (per-country minimum):
 *   getFreightQuote() queries CJ's freight calculator and returns the
 *   CHEAPEST all-in (base + taxesFee + clearanceOperationFee) non-premium
 *   method whose maximum delivery day is ≤ 15. Premium carriers (DHL,
 *   FedEx, UPS, EMS) are excluded unless they are the only option.
 *
 * Addım B (global maximum):
 *   We take the MAXIMUM of those 29 per-country minimums. This single
 *   figure is the price that covers standard shipping to every supported
 *   market without being inflated by express carrier quotes.
 *
 * The result is computed ONCE at product import time and stored in
 * `cjMaxShippingCost` / `cjMaxShippingCountry` on the Product row
 * (prisma/schema.prisma), eliminating price fluctuation between page loads.
 *
 * Performance:
 *   Countries are processed sequentially with a 1.1s delay between them
 *   (~32s total for 29 countries) to strictly respect CJ's 1 QPS rate limit.
 *   This is well within Vercel's maxDuration = 60s on the API route.
 *
 * Resilience:
 *   Per-country try/catch: a single CJ timeout never aborts the full sweep;
 *   failing countries are recorded in skipped[] and the rest are used.
 *
 * Function name, return type, and DB column are kept unchanged so all
 * existing call-sites continue to compile without modification.
 */
export async function getMaxShippingCost(params: { vid: string; quantity?: number }): Promise<MaxShippingResult> {
  const quantity = params.quantity ?? 1;

  // Filter the global markets list down to exactly the 29 target countries.
  const targetMarkets = markets.filter((m) => TARGET_COUNTRY_CODES.has(m.code));

  // Addım B accumulator — tracks the highest per-country minimum seen so far.
  let best: { cost: number; countryCode: string; methodName: string; aging: string } | null = null;
  const skipped: { countryCode: string; reason: string }[] = [];

  // CJ's rate limit is strictly 1 request per second. We must process
  // sequentially to avoid 429 Too Many Requests errors.
  for (let i = 0; i < targetMarkets.length; i++) {
    const market = targetMarkets[i];

    try {
      // Addım A: cheapest eligible method for this country.
      const quote = await getFreightQuote({ vid: params.vid, endCountryCode: market.code, quantity });
      
      if (!quote) {
        skipped.push({ countryCode: market.code, reason: "no_eligible_method" });
      } else {
        // Guard: price must be a finite positive number.
        const price = Number(quote.price);
        if (isNaN(price) || !isFinite(price) || price <= 0) {
          skipped.push({ countryCode: market.code, reason: "invalid_price" });
        } else if (!best || price > best.cost) {
          // Addım B: keep the highest of the per-country minimums.
          best = {
            cost: Number(price.toFixed(2)),
            countryCode: market.code,
            methodName: quote.methodName,
            aging: quote.aging,
          };
        }
      }
    } catch (err) {
      // Graceful degradation — log and carry on.
      console.error(
        `CJ freight error for ${market.code}:`,
        err instanceof Error ? err.message : err
      );
      skipped.push({ countryCode: market.code, reason: err instanceof Error ? err.message : "unknown_error" });
    }

    // Wait 1.1s between each request to strictly respect the 1 QPS limit.
    if (i < targetMarkets.length - 1) {
      await sleep(1100);
    }
  }

  if (!best) {
    throw new Error(
      "CJ has no eligible shipping method (max ≤ 15 days) for any of the 29 target markets (US, GB, EU)"
    );
  }

  const countryName = markets.find((m) => m.code === best!.countryCode)?.name ?? best.countryCode;
  return { ...best, countryName, skipped };
}
