import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const rateLimitKey = session.user.email ?? session.user.id;
  const { blocked, minutesLeft } = await checkBlocked(rateLimitKey, "otp_verify");
  if (blocked) {
    return NextResponse.json({ error: "blocked", minutesLeft }, { status: 429 });
  }

  const { data: pending, error: pendingError } = await supabaseNextAuth
    .from("pending_changes")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("change_type", "email")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    console.error("[change-email/verify] pending lookup error:", pendingError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!pending || pending.code !== code) {
    await recordFailedAttempt(rateLimitKey, "otp_verify");
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (new Date(pending.expires) < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  await clearAttempts(rateLimitKey, "otp_verify");

  const { error: updateError } = await supabaseNextAuth
    .from("users")
    .update({ email: pending.new_value })
    .eq("id", session.user.id);

  if (updateError) {
    console.error("[change-email/verify] user update error:", updateError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await supabaseNextAuth.from("pending_changes").delete().eq("id", pending.id);

  return NextResponse.json({ success: true, email: pending.new_value });
}
