/** Client-safe — no Prisma import, so client components can use these SiteContent keys without pulling `pg` into the browser bundle. */
export const EU_ORDER_LIMIT_KEY = "eu_order_limit_eur";
export const USD_TO_EUR_RATE_KEY = "usd_to_eur_rate";

export interface ShippingConfig {
  euOrderLimitEur: number;
  usdToEurRate: number;
}
