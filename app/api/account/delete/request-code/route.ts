import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";
import { getCurrentEmail } from "@/lib/auth/current-user";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

// Used only for accounts with no password (Google-only) — they can't type
// a password to confirm deletion, so an emailed code stands in as proof.
export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const email = await getCurrentEmail(session.user.id);
  if (!email) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { locale } = await req.json().catch(() => ({}));

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseNextAuth.from("pending_changes").delete().eq("user_id", session.user.id).eq("change_type", "account_delete");
  const { error: insertError } = await supabaseNextAuth.from("pending_changes").insert({
    user_id: session.user.id,
    identifier: email,
    change_type: "account_delete",
    code,
    expires,
  });

  if (insertError) {
    console.error("[account/delete/request-code] pending_changes insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await sendOtpEmail(email, code, locale ?? "az", "account_delete");
  return NextResponse.json({ success: true });
}
