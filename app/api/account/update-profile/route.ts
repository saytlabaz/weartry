import { NextRequest, NextResponse } from "next/server";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { safeAuth } from "@/lib/auth/safe-auth";

export async function POST(req: NextRequest) {
  const session = await safeAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, gender, phone } = await req.json();
  const updates: Record<string, string | null> = {};
  if (typeof firstName === "string") updates.first_name = firstName;
  if (typeof lastName === "string") updates.last_name = lastName;
  if (typeof gender === "string") updates.gender = gender;
  if (typeof phone === "string") updates.phone = phone;

  if (typeof firstName === "string" || typeof lastName === "string") {
    const { data: current } = await supabaseNextAuth
      .from("users")
      .select("first_name, last_name")
      .eq("id", session.user.id)
      .maybeSingle();
    const nextFirst = typeof firstName === "string" ? firstName : (current?.first_name ?? "");
    const nextLast = typeof lastName === "string" ? lastName : (current?.last_name ?? "");
    updates.name = `${nextFirst} ${nextLast}`.trim();
  }

  const { error } = await supabaseNextAuth.from("users").update(updates).eq("id", session.user.id);

  if (error) {
    console.error("[account/update-profile] update error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
