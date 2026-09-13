import { createClient } from "@supabase/supabase-js";

/**
 * Lazily constructed so a missing env var only throws when a request
 * actually reaches one of these routes, not whenever this module is merely
 * imported (e.g. during `next build`'s page-data collection).
 */
function lazyClient<T extends object>(getClient: () => T): T {
  let client: T | undefined;
  return new Proxy(
    {},
    {
      get(_target, prop, receiver) {
        if (!client) client = getClient();
        return Reflect.get(client as object, prop, receiver);
      },
    }
  ) as T;
}

/** Default (`public` schema) service-role client — used for app tables like `orders`. */
export const supabaseAdmin = lazyClient(() =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
);

/**
 * Scoped to the `next_auth` schema, where @auth/supabase-adapter keeps its
 * `users` / `sessions` / `verification_tokens` tables. The custom OTP routes
 * read/write those same tables directly, so this must target the same
 * schema the adapter uses — otherwise a user created via OTP and one created
 * via Google would live in different tables and `auth()` couldn't see either.
 */
export const supabaseNextAuth = lazyClient(() =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    db: { schema: "next_auth" },
  })
);
