import { auth } from "@/auth";

/**
 * `auth()` throws if the Supabase adapter can't construct a client (missing
 * env vars, or the database being temporarily unreachable). Pages that must
 * keep working for guests either way — checkout above all — should use this
 * instead of `auth()` directly so a session-lookup failure degrades to
 * "signed out" rather than crashing the whole page.
 */
export async function safeAuth() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
