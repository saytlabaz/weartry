import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { email: rawEmail, code, fullName, gender } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // .maybeSingle() (not .single()) so a genuine "no matching row" case
  // resolves to `data: null` instead of a PostgREST error we'd otherwise
  // have to disambiguate from a real server/config error.
  const { data: tokenRow, error: tokenError } = await supabaseNextAuth
    .from("verification_tokens")
    .select("*")
    .eq("identifier", email)
    .eq("token", code)
    .maybeSingle();

  if (tokenError) {
    console.error("[otp/verify] token lookup error:", tokenError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!tokenRow) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (new Date(tokenRow.expires) < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  await supabaseNextAuth.from("verification_tokens").delete().eq("identifier", email);

  const userLookup = await supabaseNextAuth.from("users").select("*").eq("email", email).maybeSingle();
  if (userLookup.error) {
    console.error("[otp/verify] user lookup error:", userLookup.error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  let user = userLookup.data;

  if (!user) {
    const { data: newUser, error: insertError } = await supabaseNextAuth
      .from("users")
      .insert({
        email,
        emailVerified: new Date().toISOString(),
        ...(typeof fullName === "string" && fullName ? { name: fullName } : {}),
        ...(typeof gender === "string" && gender ? { gender } : {}),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[otp/verify] user insert error:", insertError);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    user = newUser;
  }

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: sessionError } = await supabaseNextAuth.from("sessions").insert({
    userId: user!.id,
    sessionToken,
    expires: sessionExpires,
  });

  if (sessionError) {
    console.error("[otp/verify] session insert error:", sessionError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

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
