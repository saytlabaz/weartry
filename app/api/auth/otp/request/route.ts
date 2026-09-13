import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email: rawEmail, locale, mode } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || (mode !== "login" && mode !== "register")) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { data: existingUser, error: lookupError } = await supabaseNextAuth
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[otp/request] user lookup error:", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (mode === "login" && !existingUser) {
    return NextResponse.json({ error: "no_account" }, { status: 404 });
  }
  if (mode === "register" && existingUser) {
    return NextResponse.json({ error: "account_exists" }, { status: 409 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseNextAuth.from("verification_tokens").delete().eq("identifier", email);

  await supabaseNextAuth.from("verification_tokens").insert({
    identifier: email,
    token: code,
    expires,
  });

  await sendOtpEmail(email, code, locale ?? "az");

  return NextResponse.json({ success: true });
}
