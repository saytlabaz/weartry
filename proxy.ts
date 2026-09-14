import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { markets, defaultMarket } from "./i18n/markets";

const MARKET_COOKIE = "weartry_market";
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  if (!request.cookies.get(MARKET_COOKIE)) {
    // x-vercel-ip-country is populated by Vercel's edge network in production;
    // it's absent in local dev, where we simply fall back to defaultMarket.
    const countryCode = request.headers.get("x-vercel-ip-country");
    const detected = markets.find((m) => m.code === countryCode);
    response.cookies.set(MARKET_COOKIE, detected?.code ?? defaultMarket, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
