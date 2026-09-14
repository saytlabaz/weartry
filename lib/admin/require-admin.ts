import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Was HTTP Basic Auth against ADMIN_EMAIL/ADMIN_PASSWORD_HASH — a stopgap
 * from before the admin panel (and its real NextAuth-backed session)
 * existed. Now that it does, these routes are called by the admin panel's
 * own browser session (cookie-based), not Basic Auth headers, so this
 * checks that session directly instead.
 *
 * Returns a 401 response to send back immediately, or `null` if the
 * request may proceed.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return null;
}
