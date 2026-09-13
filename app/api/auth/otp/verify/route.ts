import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { email: rawEmail, code, fullName, gender } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { data: tokenRow } = await supabaseNextAuth
    .from("verification_tokens")
    .select("*")
    .eq("identifier", email)
    .eq("token", code)
    .single();

  if (!tokenRow || new Date(tokenRow.expires) < new Date()) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
  }

  await supabaseNextAuth.from("verification_tokens").delete().eq("identifier", email);

  let { data: user } = await supabaseNextAuth.from("users").select("*").eq("email", email).single();
  if (!user) {
    const { data: newUser } = await supabaseNextAuth
      .from("users")
      .insert({
        email,
        emailVerified: new Date().toISOString(),
        ...(typeof fullName === "string" && fullName ? { name: fullName } : {}),
        ...(typeof gender === "string" && gender ? { gender } : {}),
      })
      .select()
      .single();
    user = newUser;
  }

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabaseNextAuth.from("sessions").insert({
    userId: user!.id,
    sessionToken,
    expires: sessionExpires,
  });

  // Auth.js prefixes the session cookie with "__Secure-" whenever the request
  // is served over https (see @auth/core's useSecureCookies check) — match
  // that exact naming so auth()/getServerSession recognizes this cookie too.
  const isHttps = req.nextUrl.protocol === "https:";
  const cookieName = isHttps ? "__Secure-authjs.session-token" : "authjs.session-token";

  const response = NextResponse.json({ success: true, user });
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    expires: new Date(sessionExpires),
  });
  return response;
}
