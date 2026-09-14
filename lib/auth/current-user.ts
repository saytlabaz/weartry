import { supabaseNextAuth } from "@/lib/supabase/admin";

/**
 * JWT sessions cache the email/name claims from sign-in time. Routes that
 * need the user's *current* email (to send a code to it, or to compare a
 * requested change against it) must read it fresh from the database —
 * otherwise, right after a successful email change, the still-cached JWT
 * would keep pointing at the old address until the token is refreshed.
 */
export async function getCurrentEmail(userId: string): Promise<string | null> {
  const { data } = await supabaseNextAuth.from("users").select("email").eq("id", userId).maybeSingle();
  return data?.email ?? null;
}
