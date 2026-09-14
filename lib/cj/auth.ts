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

const CJ_FETCH_TIMEOUT_MS = 10_000;

/** fetch() with a hard timeout — without this, a CJ hang would stall until Vercel's own function timeout, surfacing as an opaque 502 with nothing useful in the logs. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CJ_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`CJ request timed out after ${CJ_FETCH_TIMEOUT_MS}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function requestNewToken(): Promise<{ token: string; refreshToken: string; expiresAt: Date }> {
  const apiEmail = process.env.CJ_API_EMAIL;
  const apiKey = process.env.CJ_API_KEY;
  if (!apiEmail || !apiKey) {
    throw new Error("CJ_API_EMAIL / CJ_API_KEY are not configured");
  }

  // CJ's dashboard sometimes hands out the key already fully combined as
  // "<CJUserNum>@api@<hash>" (CJ's own docs example is in this exact
  // shape) — if CJ_API_KEY already looks like that, send it as-is instead
  // of wrapping it in a second "<email>@api@..." layer, which would
  // produce a malformed, always-rejected value.
  const combinedApiKey = apiKey.includes("@api@") ? apiKey : `${apiEmail}@api@${apiKey}`;

  const res = await fetchWithTimeout(`${CJ_API_BASE_URL}/v1/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: combinedApiKey }),
  });

  const body = (await res.json()) as CjTokenResponse;

  if (!res.ok || body.code !== 200 || !body.data) {
    // CJ almost always answers with HTTP 200 and puts the real outcome in
    // the JSON body's own `code` — logging both that and the raw HTTP
    // status makes "is this a network/HTTP problem or a CJ-side rejection"
    // obvious from the Vercel log line alone, without needing to reproduce.
    throw new Error(
      `CJ getAccessToken failed (HTTP ${res.status}, CJ code ${body.code}): ${body.message ?? res.statusText}`
    );
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
  return fetchWithTimeout(`${CJ_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
      ...init.headers,
    },
  });
}
