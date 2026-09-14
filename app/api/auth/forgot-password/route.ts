import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email: rawEmail, locale } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { data: user, error: lookupError } = await supabaseNextAuth
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[forgot-password] user lookup error:", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "no_account" }, { status: 404 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseNextAuth.from("pending_changes").delete().eq("identifier", email).eq("change_type", "password_reset");
  const { error: insertError } = await supabaseNextAuth.from("pending_changes").insert({
    identifier: email,
    change_type: "password_reset",
    code,
    expires,
  });

  if (insertError) {
    console.error("[forgot-password] pending_changes insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await sendOtpEmail(email, code, locale ?? "az", "password_reset");
  return NextResponse.json({ success: true });
}
