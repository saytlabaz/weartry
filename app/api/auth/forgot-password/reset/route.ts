import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const { email: rawEmail, code, newPassword } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  const { blocked, minutesLeft } = await checkBlocked(email, "otp_verify");
  if (blocked) {
    return NextResponse.json({ error: "blocked", minutesLeft }, { status: 429 });
  }

  const { data: pending, error: pendingError } = await supabaseNextAuth
    .from("pending_changes")
    .select("*")
    .eq("identifier", email)
    .eq("change_type", "password_reset")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    console.error("[forgot-password/reset] pending lookup error:", pendingError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!pending || pending.code !== code) {
    await recordFailedAttempt(email, "otp_verify");
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (new Date(pending.expires) < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  await clearAttempts(email, "otp_verify");

  const passwordHash = await hashPassword(newPassword);
  const { error: updateError } = await supabaseNextAuth
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("email", email);

  if (updateError) {
    console.error("[forgot-password/reset] user update error:", updateError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await supabaseNextAuth.from("pending_changes").delete().eq("id", pending.id);

  return NextResponse.json({ success: true });
}
