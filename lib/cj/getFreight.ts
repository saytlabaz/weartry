import { cjFetch } from "./auth";

const WINDOW_MIN_DAYS = 7;
const WINDOW_MAX_DAYS = 15;

/**
 * Raw shape of one freight method returned by CJ's freightCalculate endpoint.
 * All numeric fields arrive as numbers *or* numeric strings depending on the
 * CJ API version — parseFloat() is used defensively on every field below.
 */
interface CjFreightMethod {
  /** Base freight price charged by the carrier (USD). */
  logisticPrice: number | string;
  /** Same price expressed in CNY — not used for comparisons. */
  logisticPriceCn?: number | string;
  /** Free-text delivery time estimate, e.g. "8-15 days". */
  logisticAging: string;
  /** Human-readable carrier / service name, e.g. "CJPacket Ordinary". */
  logisticName: string;
  /**
   * Import/customs handling fee added on top of the base freight price.
   * Present on some methods (especially EU destinations), absent on others.
   */
  taxesFee?: number | string;
  /** Additional customs clearance handling fee, where applicable. */
  clearanceOperationFee?: number | string;
  /**
   * Pre-summed total from CJ that may include all surcharges.
   * We compute our own total from individual fields rather than trusting
   * this field, because it is not always present and may be 0 even when
   * the component fees are non-zero.
   */
  totalPostageFee?: number | string;
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

/**
 * Computes the all-in price for a CJ freight method.
 *
 * CJ's freightCalculate response may split the cost into:
 *   logisticPrice          — base carrier freight charge
 *   taxesFee               — import/customs fee (EU destinations etc.)
 *   clearanceOperationFee  — customs handling surcharge
 *
 * We sum all three (defaulting missing/null/non-numeric fields to 0) so
 * that comparisons and the final stored value reflect what CJ will actually
 * invoice, not just the base freight rate.
 *
 * Every field is run through parseFloat() to guard against the API
 * occasionally returning numeric strings instead of numbers.
 */
function computeTotalPrice(m: CjFreightMethod): number {
  const base = parseFloat(String(m.logisticPrice)) || 0;
  const taxes = parseFloat(String(m.taxesFee ?? 0)) || 0;
  const clearance = parseFloat(String(m.clearanceOperationFee ?? 0)) || 0;
  const total = base + taxes + clearance;
  // Round to 2 decimal places, then convert back to a number so downstream
  // comparisons stay in the numeric domain (never NaN, never a string).
  return Number(total.toFixed(2));
}

export interface FreightQuote {
  price: number;
  methodName: string;
  aging: string;
}

/**
 * Premium carrier keywords that are excluded from selection unless they
 * are the only option available in the target day window. Matching is
 * case-insensitive against logisticName.
 */
const PREMIUM_CARRIERS = ["dhl", "fedex", "ups", "ems"];

/** Returns true when the method name belongs to a premium/express carrier. */
function isPremiumCarrier(name: string): boolean {
  const lower = name.toLowerCase();
  return PREMIUM_CARRIERS.some((kw) => lower.includes(kw));
}

/**
 * Calls CJ's freight calculator (POST /v1/logistic/freightCalculate) for
 * one destination country and returns the cheapest standard (non-premium)
 * method whose quoted shipping time falls in the WINDOW_MIN_DAYS–WINDOW_MAX_DAYS
 * window. The returned `price` is the all-in cost (base + taxes + clearance
 * fee) rounded to 2 decimal places.
 *
 * Premium carriers (DHL, FedEx, UPS, EMS) are excluded unless they are the
 * only options in the window. Returns null when CJ has no method in that
 * window for this country.
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

  // TEMPORARY — verifying price parsing live against a concrete example (DE).
  if (params.endCountryCode === "DE") {
    console.error(`CJ freight debug (DE): raw response=${JSON.stringify(body)}`);
  }

  if (!res.ok || body.code !== 200 || !Array.isArray(body.data)) {
    throw new Error(
      `CJ freightCalculate failed (HTTP ${res.status}, CJ code ${body.code}): ${body.message ?? res.statusText}`
    );
  }

  if (body.data.length === 0) return null;

  const inWindow = body.data
    .map((m) => ({ method: m, range: parseAgingDays(m.logisticAging), total: computeTotalPrice(m) }))
    .filter(
      (m): m is { method: CjFreightMethod; range: [number, number]; total: number } =>
        m.range !== null &&
        isWithinWindow(m.range, WINDOW_MIN_DAYS, WINDOW_MAX_DAYS) &&
        !isNaN(m.total)
    );

  if (inWindow.length === 0) return null;

  // Prefer standard (non-premium) carriers; fall back to premium-only pool
  // if no standard option is available in the window.
  const standard = inWindow.filter((m) => !isPremiumCarrier(m.method.logisticName));
  const pool = standard.length > 0 ? standard : inWindow;

  // Pick the cheapest all-in method from the selected pool.
  const cheapest = pool.reduce((a, b) => (b.total < a.total ? b : a));

  return {
    price: cheapest.total,
    methodName: cheapest.method.logisticName,
    aging: cheapest.method.logisticAging,
  };
}
