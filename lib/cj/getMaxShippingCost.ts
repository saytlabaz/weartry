import { markets } from "@/i18n/markets";
import { getFreightQuote } from "./getFreight";

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
 * Performance:
 *   - Countries are processed in parallel chunks of CHUNK_SIZE (5) with a
 *     BETWEEN_CHUNKS_MS (1 s) gap between chunks to respect CJ's rate
 *     limit. This cuts total wall-clock time from ~33 s (sequential with
 *     1.1 s spacing) down to ~8-10 s for 29 countries, well within
 *     Vercel's maxDuration = 60 s set on the API route.
 *
 * Resilience:
 *   - A per-country try/catch means a single CJ timeout or error never
 *     aborts the entire sweep; the failing country is recorded in
 *     `skipped` and the rest of the results are used normally.
 *
 * The result is stored in `cjMaxShippingCost` / `cjMaxShippingCountry`
 * on the Product row (see prisma/schema.prisma) — a pricing reference only;
 * nothing reads it to directly charge customers.
 *
 * Function name, return type, and the DB column name are kept unchanged so
 * all existing call-sites continue to compile without modification.
 */
export async function getMaxShippingCost(params: { vid: string; quantity?: number }): Promise<MaxShippingResult> {
  const quantity = params.quantity ?? 1;

  // Target markets: all EU members + GB + US — derived from the existing
  // euMember flag in i18n/markets.ts; no new configuration needed.
  const targetMarkets = markets.filter((m) => m.euMember || m.code === "GB" || m.code === "US");

  // Addım B accumulator — tracks the highest per-country minimum seen so far.
  let best: { cost: number; countryCode: string; methodName: string; aging: string } | null = null;
  const skipped: { countryCode: string; reason: string }[] = [];

  // Split the target markets into chunks of CHUNK_SIZE and process each
  // chunk in parallel, with a short pause between chunks.
  const marketChunks = chunk(targetMarkets, CHUNK_SIZE);

  for (let ci = 0; ci < marketChunks.length; ci++) {
    const currentChunk = marketChunks[ci];

    // Fire all requests in this chunk simultaneously (Addım A).
    const chunkResults = await Promise.all(
      currentChunk.map(async (market) => {
        try {
          // Addım A: getFreightQuote returns the cheapest non-premium method
          // in the acceptable day window for this country.
          const quote = await getFreightQuote({ vid: params.vid, endCountryCode: market.code, quantity });
          return { market, quote, error: null };
        } catch (err) {
          // Graceful degradation: log and carry on — one country's failure
          // must not abort the entire 29-country sweep.
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
        skipped.push({ countryCode: market.code, reason: "no_method_in_window" });
      } else if (!best || quote.price > best.cost) {
        // Addım B: keep the highest of the per-country minimums.
        best = { cost: quote.price, countryCode: market.code, methodName: quote.methodName, aging: quote.aging };
      }
    }

    // Wait between chunks (not after the last one) to stay within CJ's rate limit.
    if (ci < marketChunks.length - 1) await sleep(BETWEEN_CHUNKS_MS);
  }

  if (!best) {
    throw new Error(
      "CJ has no standard shipping method in the target day window for any supported market (EU + GB + US)"
    );
  }

  const countryName = markets.find((m) => m.code === best!.countryCode)?.name ?? best.countryCode;
  return { ...best, countryName, skipped };
}
