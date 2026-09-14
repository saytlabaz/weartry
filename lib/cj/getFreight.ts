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
}

/**
 * Calls CJ's freight calculator (POST /v1/logistic/freightCalculate) for
 * one destination country, and returns the most expensive method whose
 * quoted shipping time falls in the 8-15 day window — per the admin
 * panel's requirement to reference the highest plausible cost, not the
 * cheapest. Returns null if CJ has no method in that window for this
 * country (e.g. it doesn't ship there at all).
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
  if (!res.ok || body.code !== 200 || !Array.isArray(body.data)) {
    throw new Error(`CJ freightCalculate failed (HTTP ${res.status}, CJ code ${body.code}): ${body.message ?? res.statusText}`);
  }

  const inWindow = body.data
    .map((m) => ({ method: m, range: parseAgingDays(m.logisticAging) }))
    .filter((m): m is { method: CjFreightMethod; range: [number, number] } => m.range !== null && isWithinWindow(m.range, 8, 15));

  if (inWindow.length === 0) return null;

  const most = inWindow.reduce((a, b) => (b.method.logisticPrice > a.method.logisticPrice ? b : a));
  return { price: most.method.logisticPrice, methodName: most.method.logisticName, aging: most.method.logisticAging };
}
