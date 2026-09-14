import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";
import { generateOtpCode, sendOtpEmail } from "@/lib/auth/send-otp-email";

export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { locale } = await req.json().catch(() => ({}));
  const email = session.user.email;

  const code = generateOtpCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseNextAuth.from("pending_changes").delete().eq("user_id", session.user.id).eq("change_type", "password_change");
  const { error: insertError } = await supabaseNextAuth.from("pending_changes").insert({
    user_id: session.user.id,
    identifier: email,
    change_type: "password_change",
    code,
    expires,
  });

  if (insertError) {
    console.error("[change-password/request] pending_changes insert error:", insertError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await sendOtpEmail(email, code, locale ?? "az");
  return NextResponse.json({ success: true });
}
