export interface CheckoutInfo {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
}

const STORAGE_KEY = "weartry_checkout_info";

// Caches by comparing the raw stored string, not a freshly-JSON.parse'd
// object — useSyncExternalStore compares consecutive getSnapshot() results
// with Object.is, so returning a new object reference on every call (which
// plain JSON.parse would) reads as "changed every render" and either warns
// or loops. Re-parsing only when the raw string actually differs keeps the
// same reference across renders where nothing changed.
let cachedRaw: string | null = null;
let cached: CheckoutInfo | null = null;

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCheckoutInfo(info: CheckoutInfo) {
  const raw = JSON.stringify(info);
  try {
    sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // sessionStorage unavailable — /payment will fall back to redirecting to /checkout.
  }
  cachedRaw = raw;
  cached = info;
}

export function clearCheckoutInfo() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  cachedRaw = null;
  cached = null;
}

export function getCheckoutInfoSnapshot(): CheckoutInfo | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = raw ? (JSON.parse(raw) as CheckoutInfo) : null;
  }
  return cached;
}

export function getCheckoutInfoServerSnapshot(): CheckoutInfo | null {
  return null;
}

export function subscribeCheckoutInfo() {
  // No cross-tab/live reactivity needed — getSnapshot is re-checked on
  // every render already, which is enough for this single-page flow. A
  // function with fewer params than useSyncExternalStore's subscribe type
  // expects is still assignable to it — the callback arg just goes unused.
  return () => {};
}
