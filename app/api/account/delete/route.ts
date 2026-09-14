import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";
import { verifyPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

// Deleting next_auth.users cascades to accounts/sessions/pending_changes
// and public.wishlists (all `on delete cascade`); public.orders keeps the
// order history but sets user_id to null (`on delete set null`) — order
// records are kept for accounting purposes, just unlinked from the account.
export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { password, code } = await req.json();

  const { data: user, error: lookupError } = await supabaseNextAuth
    .from("users")
    .select("password_hash")
    .eq("id", session.user.id)
    .maybeSingle();

  if (lookupError || !user) {
    console.error("[account/delete] user lookup error:", lookupError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (user.password_hash) {
    const { blocked, minutesLeft } = await checkBlocked(session.user.id, "delete_password");
    if (blocked) {
      return NextResponse.json({ error: "blocked", minutesLeft }, { status: 429 });
    }
    if (typeof password !== "string" || !(await verifyPassword(password, user.password_hash))) {
      const attempt = await recordFailedAttempt(session.user.id, "delete_password");
      if (attempt.blocked) {
        return NextResponse.json({ error: "blocked", minutesLeft: attempt.minutesLeft }, { status: 429 });
      }
      return NextResponse.json({ error: "invalid_password", attemptsLeft: attempt.attemptsLeft }, { status: 400 });
    }
    await clearAttempts(session.user.id, "delete_password");
  } else {
    if (typeof code !== "string" || !code) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const { blocked, minutesLeft } = await checkBlocked(session.user.id, "otp_verify");
    if (blocked) {
      return NextResponse.json({ error: "blocked", minutesLeft }, { status: 429 });
    }
    const { data: pending } = await supabaseNextAuth
      .from("pending_changes")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("change_type", "account_delete")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pending || pending.code !== code) {
      const attempt = await recordFailedAttempt(session.user.id, "otp_verify");
      if (attempt.blocked) {
        return NextResponse.json({ error: "blocked", minutesLeft: attempt.minutesLeft }, { status: 429 });
      }
      return NextResponse.json({ error: "invalid_code", attemptsLeft: attempt.attemptsLeft }, { status: 400 });
    }
    if (new Date(pending.expires) < new Date()) {
      return NextResponse.json({ error: "code_expired" }, { status: 400 });
    }
    await clearAttempts(session.user.id, "otp_verify");
  }

  const { error: deleteError } = await supabaseNextAuth.from("users").delete().eq("id", session.user.id);

  if (deleteError) {
    console.error("[account/delete] delete error:", deleteError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
