/**
 * Wraps a DB read used by a storefront page with a fallback for when it
 * fails — most importantly, when DATABASE_URL isn't set at all, which
 * `next build`'s static-generation pass hits locally (no access to the
 * real, Production-scoped DATABASE_URL). Storefront pages that read
 * admin-managed content (FeaturedProducts, Hero overrides, FaqPage) should
 * degrade to "nothing admin-managed yet" rather than fail the whole page —
 * a transient DB hiccup shouldn't take the homepage down either.
 */
export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    console.error("[db-safe] query failed, using fallback:", err instanceof Error ? err.message : err);
    return fallback;
  }
}
