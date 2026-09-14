import { NextRequest, NextResponse } from "next/server";
import { getProvinces } from "@/lib/checkout/provinces";

/**
 * Returns the province/state list for a country code, for the checkout
 * form's province dropdown — see lib/checkout/provinces.ts for why this is
 * a curated static list rather than a proxy to CJ's API (which has no such
 * endpoint — this route and its lib helper used to live under a `cj/`
 * path even though they never actually call CJ, which leaked the supplier
 * name into a URL visible in the browser's Network tab; renamed to keep
 * the storefront's own-brand surface clean). An empty array means the
 * destination country doesn't need one; the checkout form should fall back
 * to an optional free-text field rather than block the user on a required
 * dropdown with no options.
 */
export async function GET(req: NextRequest) {
  const countryCode = req.nextUrl.searchParams.get("countryCode");
  if (!countryCode) {
    return NextResponse.json({ error: "missing_country_code" }, { status: 400 });
  }

  return NextResponse.json({ countryCode: countryCode.toUpperCase(), provinces: getProvinces(countryCode) });
}
