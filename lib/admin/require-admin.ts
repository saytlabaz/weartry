import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";

/**
 * TODO: replace with real admin sessions once the admin panel (and its own
 * NextAuth-backed login) exists — this is deliberately minimal: HTTP Basic
 * Auth checked against ADMIN_EMAIL / ADMIN_PASSWORD_HASH. It's here so
 * these routes aren't sitting wide open on production (they return
 * customer names, emails, and addresses) while still being simple enough
 * to delete in one place later.
 *
 * Returns a 401 response to send back immediately, or `null` if the
 * request may proceed.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const unauthorized = () =>
    NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "WWW-Authenticate": "Basic" } });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminPasswordHash) {
    // Not configured yet — fail closed rather than silently letting
    // requests through.
    return NextResponse.json({ error: "admin_auth_not_configured" }, { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let email = "";
  let password = "";
  try {
    [email, password] = Buffer.from(header.slice(6), "base64").toString("utf8").split(":");
  } catch {
    return unauthorized();
  }

  if (email !== adminEmail) return unauthorized();
  const valid = await verifyPassword(password ?? "", adminPasswordHash);
  if (!valid) return unauthorized();

  return null;
}
