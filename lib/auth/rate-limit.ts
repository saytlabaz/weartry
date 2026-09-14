import { supabaseNextAuth } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 saat

export async function checkBlocked(
  identifier: string,
  attemptType: string
): Promise<{ blocked: boolean; minutesLeft?: number }> {
  const { data } = await supabaseNextAuth
    .from("auth_attempts")
    .select("*")
    .eq("identifier", identifier)
    .eq("attempt_type", attemptType)
    .maybeSingle();

  if (data?.blocked_until && new Date(data.blocked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(data.blocked_until).getTime() - Date.now()) / 60000);
    return { blocked: true, minutesLeft };
  }
  return { blocked: false };
}

export async function recordFailedAttempt(identifier: string, attemptType: string): Promise<void> {
  const { data } = await supabaseNextAuth
    .from("auth_attempts")
    .select("*")
    .eq("identifier", identifier)
    .eq("attempt_type", attemptType)
    .maybeSingle();

  const newCount = (data?.failed_count ?? 0) + 1;
  const blockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + BLOCK_DURATION_MS).toISOString() : null;

  await supabaseNextAuth.from("auth_attempts").upsert(
    {
      identifier,
      attempt_type: attemptType,
      failed_count: newCount,
      blocked_until: blockedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "identifier,attempt_type" }
  );
}

export async function clearAttempts(identifier: string, attemptType: string): Promise<void> {
  await supabaseNextAuth.from("auth_attempts").delete().eq("identifier", identifier).eq("attempt_type", attemptType);
}
