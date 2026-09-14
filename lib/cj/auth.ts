import { prisma } from "@/lib/prisma";

const CJ_API_BASE_URL = process.env.CJ_API_BASE_URL ?? "https://developers.cjdropshipping.com/api2.0";

interface CjTokenResponse {
  code: number;
  message?: string;
  data?: {
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
  };
}

/**
 * CJ's access token is valid 180 days and refreshing it invalidates the
 * previous one, so this caches it in the DB (CjApiToken) instead of
 * re-requesting on every call. Re-fetches a few hours early to avoid a
 * request failing right at the boundary.
 */
const EXPIRY_SAFETY_MARGIN_MS = 6 * 60 * 60 * 1000;

async function requestNewToken(): Promise<{ token: string; refreshToken: string; expiresAt: Date }> {
  const apiEmail = process.env.CJ_API_EMAIL;
  const apiKey = process.env.CJ_API_KEY;
  if (!apiEmail || !apiKey) {
    throw new Error("CJ_API_EMAIL / CJ_API_KEY are not configured");
  }

  const res = await fetch(`${CJ_API_BASE_URL}/v1/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // CJ's getAccessToken takes the API key value itself, formatted
    // "<accountEmail>@api@<key>" per CJ's docs — CJ_API_EMAIL identifies
    // which CJ account the key belongs to.
    body: JSON.stringify({ apiKey: `${apiEmail}@api@${apiKey}` }),
  });

  const body = (await res.json()) as CjTokenResponse;
  if (!res.ok || body.code !== 200 || !body.data) {
    throw new Error(`CJ getAccessToken failed: ${body.message ?? res.statusText}`);
  }

  return {
    token: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    expiresAt: new Date(body.data.accessTokenExpiryDate),
  };
}

/**
 * Returns a valid CJ access token, reusing the cached one in CjApiToken
 * when it isn't close to expiring, and requesting a fresh one otherwise.
 */
export async function getCjAccessToken(): Promise<string> {
  const cached = await prisma.cjApiToken.findFirst({ orderBy: { createdAt: "desc" } });

  if (cached && cached.expiresAt.getTime() - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
    return cached.token;
  }

  const fresh = await requestNewToken();
  await prisma.cjApiToken.create({
    data: { token: fresh.token, refreshToken: fresh.refreshToken, expiresAt: fresh.expiresAt },
  });
  return fresh.token;
}

/** Base fetch wrapper for authenticated CJ API calls — attaches the CJ-Access-Token header. */
export async function cjFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getCjAccessToken();
  return fetch(`${CJ_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
      ...init.headers,
    },
  });
}
