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

/**
 * How many countries are queried in parallel within each chunk.
 * CJ's documented rate limit is ~5 req/s; using 5 keeps us safely
 * within that while cutting total wall-clock time by ~5×.
 */
const CHUNK_SIZE = 5;

/**
 * Delay between chunks (not between individual requests inside a chunk,
 * since those run in parallel). 1 s gap lets CJ's token bucket refill
 * before the next burst of 5 simultaneous requests.
 */
const BETWEEN_CHUNKS_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Splits an array into sequential sub-arrays of at most `size` elements. */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
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
 *   Countries are processed in parallel chunks of CHUNK_SIZE (5) with a
 *   BETWEEN_CHUNKS_MS (1 s) gap between chunks (~8-10 s total for 29
 *   countries, well within Vercel's maxDuration = 60 s on the API route).
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

  const marketChunks = chunk(targetMarkets, CHUNK_SIZE);

  for (let ci = 0; ci < marketChunks.length; ci++) {
    const currentChunk = marketChunks[ci];

    // Fire all requests in this chunk simultaneously.
    const chunkResults = await Promise.all(
      currentChunk.map(async (market) => {
        try {
          // Addım A: cheapest eligible method for this country.
          const quote = await getFreightQuote({ vid: params.vid, endCountryCode: market.code, quantity });
          return { market, quote, error: null };
        } catch (err) {
          // Graceful degradation — log and carry on.
          console.error(
            `CJ freight error for ${market.code}:`,
            err instanceof Error ? err.message : err
          );
          return { market, quote: null, error: err instanceof Error ? err.message : "unknown_error" };
        }
      })
    );

    // Merge this chunk's results into the global accumulators.
    for (const { market, quote, error } of chunkResults) {
      if (error !== null) {
        skipped.push({ countryCode: market.code, reason: error });
      } else if (!quote) {
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
    }

    // Wait between chunks to stay within CJ's rate limit (skip after last chunk).
    if (ci < marketChunks.length - 1) await sleep(BETWEEN_CHUNKS_MS);
  }

  if (!best) {
    throw new Error(
      "CJ has no eligible shipping method (max ≤ 15 days) for any of the 29 target markets (US, GB, EU)"
    );
  }

  const countryName = markets.find((m) => m.code === best!.countryCode)?.name ?? best.countryCode;
  return { ...best, countryName, skipped };
}
