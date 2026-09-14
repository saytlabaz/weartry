import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { markets, defaultMarket } from "./i18n/markets";

const MARKET_COOKIE = "weartry_market";
const intlMiddleware = createMiddleware(routing);

const ADMIN_LOGIN_PATH = "/idarepaneli/giris";

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  if (!token) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export default async function proxy(request: NextRequest) {
  // /idarepaneli is a fixed-language admin section, entirely outside the
  // storefront's next-intl locale routing — handle it before intlMiddleware
  // ever sees the request, not as another locale-prefixed path.
  if (request.nextUrl.pathname.startsWith("/idarepaneli")) {
    return handleAdminRoute(request);
  }

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
