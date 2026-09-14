import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const { email: rawEmail, code } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || !code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { blocked, minutesLeft } = await checkBlocked(email, "otp_verify");
  if (blocked) {
    return NextResponse.json({ error: "blocked", minutesLeft }, { status: 429 });
  }

  const { data: pending, error: pendingError } = await supabaseNextAuth
    .from("pending_changes")
    .select("*")
    .eq("identifier", email)
    .eq("change_type", "register")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    console.error("[auth/register/verify] pending lookup error:", pendingError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!pending || pending.code !== code) {
    const attempt = await recordFailedAttempt(email, "otp_verify");
    if (attempt.blocked) {
      return NextResponse.json({ error: "blocked", minutesLeft: attempt.minutesLeft }, { status: 429 });
    }
    return NextResponse.json({ error: "invalid_code", attemptsLeft: attempt.attemptsLeft }, { status: 400 });
  }
  if (new Date(pending.expires) < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  await clearAttempts(email, "otp_verify");

  const regData = JSON.parse(pending.new_value!) as {
    firstName: string;
    lastName: string;
    passwordHash: string;
  };

  const { error: insertError } = await supabaseNextAuth.from("users").insert({
    email,
    name: `${regData.firstName} ${regData.lastName}`.trim(),
    first_name: regData.firstName,
    last_name: regData.lastName,
    password_hash: regData.passwordHash,
    emailVerified: new Date().toISOString(),
  });

  if (insertError) {
    console.error("[auth/register/verify] user insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await supabaseNextAuth.from("pending_changes").delete().eq("id", pending.id);

  return NextResponse.json({ success: true });
}
