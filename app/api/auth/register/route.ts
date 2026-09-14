import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";
import { hashPassword } from "@/lib/auth/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { firstName, lastName, email: rawEmail, password, locale } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!firstName || !lastName || !EMAIL_RE.test(email) || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  const { data: existingUser, error: lookupError } = await supabaseNextAuth
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[auth/register] user lookup error:", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (existingUser) {
    return NextResponse.json({ error: "account_exists" }, { status: 409 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const passwordHash = await hashPassword(password);

  await supabaseNextAuth.from("pending_changes").delete().eq("identifier", email).eq("change_type", "register");
  const { error: insertError } = await supabaseNextAuth.from("pending_changes").insert({
    identifier: email,
    change_type: "register",
    new_value: JSON.stringify({ firstName, lastName, passwordHash }),
    code,
    expires,
  });

  if (insertError) {
    console.error("[auth/register] pending_changes insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await sendOtpEmail(email, code, locale ?? "az", "register");

  return NextResponse.json({ success: true });
}
