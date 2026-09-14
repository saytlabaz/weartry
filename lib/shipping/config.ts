import { prisma } from "@/lib/prisma";
import { dbSafe } from "@/lib/db-safe";
import { EU_ORDER_LIMIT_KEY, USD_TO_EUR_RATE_KEY, type ShippingConfig } from "./constants";

export { EU_ORDER_LIMIT_KEY, USD_TO_EUR_RATE_KEY, type ShippingConfig };

const CONFIG_LOCALE = "az";

// CJ ships under the EU's IOSS scheme, which caps the *goods* value (not
// shipping) admissible for import-VAT-at-checkout per order at €150 —
// above that, the shipment needs full customs clearance instead. Defaults
// below are starting points; both are admin-editable from
// /idarepaneli/sehifeler's "Çatdırılma" tab rather than hardcoded, since
// the EU threshold or the exchange rate can both change over time.
const DEFAULT_EU_ORDER_LIMIT_EUR = 150;
const DEFAULT_USD_TO_EUR_RATE = 0.92;

export async function getShippingConfig(): Promise<ShippingConfig> {
  const rows = await dbSafe(
    () =>
      prisma.siteContent.findMany({
        where: { locale: CONFIG_LOCALE, key: { in: [EU_ORDER_LIMIT_KEY, USD_TO_EUR_RATE_KEY] } },
        select: { key: true, value: true },
      }),
    []
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const euOrderLimitEur = Number(map[EU_ORDER_LIMIT_KEY]);
  const usdToEurRate = Number(map[USD_TO_EUR_RATE_KEY]);

  return {
    euOrderLimitEur: Number.isFinite(euOrderLimitEur) && euOrderLimitEur > 0 ? euOrderLimitEur : DEFAULT_EU_ORDER_LIMIT_EUR,
    usdToEurRate: Number.isFinite(usdToEurRate) && usdToEurRate > 0 ? usdToEurRate : DEFAULT_USD_TO_EUR_RATE,
  };
}
