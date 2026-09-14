import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";
import { getCurrentEmail } from "@/lib/auth/current-user";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const currentEmail = await getCurrentEmail(session.user.id);

  const { newEmail: rawEmail, locale } = await req.json();
  const newEmail = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(newEmail)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (newEmail === currentEmail?.toLowerCase()) {
    return NextResponse.json({ error: "same_email" }, { status: 400 });
  }

  const { data: taken, error: lookupError } = await supabaseNextAuth
    .from("users")
    .select("id")
    .eq("email", newEmail)
    .maybeSingle();

  if (lookupError) {
    console.error("[change-email/request] lookup error:", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (taken) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseNextAuth.from("pending_changes").delete().eq("user_id", session.user.id).eq("change_type", "email");
  const { error: insertError } = await supabaseNextAuth.from("pending_changes").insert({
    user_id: session.user.id,
    identifier: currentEmail ?? newEmail,
    change_type: "email",
    new_value: newEmail,
    code,
    expires,
  });

  if (insertError) {
    console.error("[change-email/request] pending_changes insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await sendOtpEmail(newEmail, code, locale ?? "az", "email_change");
  return NextResponse.json({ success: true });
}
