import { cjFetch } from "./auth";

const WINDOW_MIN_DAYS = 7;
const WINDOW_MAX_DAYS = 10;

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

/** True when a [min, max] shipping-time range falls inside the target day window (any overlap counts). */
function isWithinWindow(range: [number, number], windowMin: number, windowMax: number): boolean {
  const [min, max] = range;
  return min <= windowMax && max >= windowMin;
}

export interface FreightQuote {
  price: number;
  methodName: string;
  aging: string;
}

/**
 * Calls CJ's freight calculator (POST /v1/logistic/freightCalculate) for
 * one destination country and returns the most expensive method whose
 * quoted shipping time falls in the WINDOW_MIN_DAYS-WINDOW_MAX_DAYS
 * window. Returns null when CJ has no method in that window for this
 * country — that country is then excluded entirely from the max-shipping
 * calculation, never substituted with an out-of-window (e.g. express)
 * method. An earlier version fell back to the priciest method regardless
 * of timeframe when nothing matched, which let $30-80 express/freight
 * options masquerade as the reference "standard shipping" cost.
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
      startCountryCode: params.startCountryCode ?? "CN",
      endCountryCode: params.endCountryCode,
      products: [{ vid: params.vid, quantity: params.quantity }],
    }),
  });

  const body = (await res.json()) as CjFreightResponse;

  // TEMPORARY — verifying the 7-10 day window + no-fallback fix live
  // against a concrete example (Germany) before removing this.
  if (params.endCountryCode === "DE") {
    console.error(`CJ freight debug (DE): raw response=${JSON.stringify(body)}`);
  }

  if (!res.ok || body.code !== 200 || !Array.isArray(body.data)) {
    throw new Error(`CJ freightCalculate failed (HTTP ${res.status}, CJ code ${body.code}): ${body.message ?? res.statusText}`);
  }

  if (body.data.length === 0) return null;

  const inWindow = body.data
    .map((m) => ({ method: m, range: parseAgingDays(m.logisticAging) }))
    .filter(
      (m): m is { method: CjFreightMethod; range: [number, number] } =>
        m.range !== null && isWithinWindow(m.range, WINDOW_MIN_DAYS, WINDOW_MAX_DAYS)
    );

  if (inWindow.length === 0) return null;

  const most = inWindow.reduce((a, b) => (b.method.logisticPrice > a.method.logisticPrice ? b : a));

  return {
    price: most.method.logisticPrice,
    methodName: most.method.logisticName,
    aging: most.method.logisticAging,
  };
}
