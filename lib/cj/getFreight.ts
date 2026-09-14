import { cjFetch } from "./auth";

interface CjFreightMethod {
  logisticPrice: number;
  logisticPriceCn?: number;
  logisticAging: string;
  logisticName: string;
  taxesFee?: number;
  clearanceOperationFee?: number;
  totalPostageFee?: number;
}

interface CjFreightResponse {
  code: number;
  message?: string;
  data?: CjFreightMethod[];
}

/**
 * Parses CJ's `logisticAging` field (a free-text shipping-time string,
 * e.g. "8-15 days", "10-20 Days", "7-12") into [min, max] days. Returns
 * null when it doesn't look like a day range at all.
 */
function parseAgingDays(aging: string): [number, number] | null {
  const match = aging.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

/** True when a [min, max] shipping-time range falls inside the target 8-15 day window (any overlap counts). */
function isWithinWindow(range: [number, number], windowMin: number, windowMax: number): boolean {
  const [min, max] = range;
  return min <= windowMax && max >= windowMin;
}

export interface FreightQuote {
  price: number;
  methodName: string;
  aging: string;
  /** False when CJ has no method whose quoted time falls in the 8-15 day window for this country — `price` is then the most expensive method CJ offers regardless of timeframe, not a made-up number. */
  inWindow: boolean;
}

/**
 * Calls CJ's freight calculator (POST /v1/logistic/freightCalculate) for
 * one destination country. Prefers the most expensive method whose quoted
 * shipping time falls in the 8-15 day window; if CJ has methods for this
 * country but none land in that window, falls back to the most expensive
 * method CJ offers regardless of timeframe (flagged via `inWindow: false`)
 * rather than treating it as no result — CJ genuinely ships there, the
 * 8-15 day constraint just doesn't apply to this specific variant/route.
 * Returns null only when CJ has no shipping method to this country at all.
 */
export async function getFreightQuote(params: {
  vid: string;
  endCountryCode: string;
  quantity: number;
  startCountryCode?: string;
}): Promise<FreightQuote | null> {
  const res = await cjFetch("/v1/logistic/freightCalculate", {
    method: "POST",
    body: JSON.stringify({
      vid: params.vid,
      quantity: params.quantity,
      startCountryCode: params.startCountryCode ?? "CN",
      endCountryCode: params.endCountryCode,
    }),
  });

  const body = (await res.json()) as CjFreightResponse;

  // TEMPORARY — every country is coming back empty for every product
  // tested, which points at a systemic request problem rather than "this
  // product has no route." Logs the raw CJ response for AT (first in the
  // sweep) and US (last), to see the actual answer fast instead of
  // guessing at it or waiting through all 29. Remove once confirmed.
  if (params.endCountryCode === "AT" || params.endCountryCode === "US") {
    console.error(
      `CJ freight debug: request=${JSON.stringify({ vid: params.vid, quantity: params.quantity, startCountryCode: params.startCountryCode ?? "CN", endCountryCode: params.endCountryCode })}, raw response=${JSON.stringify(body)}`
    );
  }

  if (!res.ok || body.code !== 200 || !Array.isArray(body.data)) {
    throw new Error(`CJ freightCalculate failed (HTTP ${res.status}, CJ code ${body.code}): ${body.message ?? res.statusText}`);
  }

  if (body.data.length === 0) return null;

  const withRange = body.data.map((m) => ({ method: m, range: parseAgingDays(m.logisticAging) }));
  const inWindow = withRange.filter(
    (m): m is { method: CjFreightMethod; range: [number, number] } => m.range !== null && isWithinWindow(m.range, 8, 15)
  );

  const pool = inWindow.length > 0 ? inWindow : withRange;
  const most = pool.reduce((a, b) => (b.method.logisticPrice > a.method.logisticPrice ? b : a));

  return {
    price: most.method.logisticPrice,
    methodName: most.method.logisticName,
    aging: most.method.logisticAging,
    inWindow: inWindow.length > 0,
  };
}
