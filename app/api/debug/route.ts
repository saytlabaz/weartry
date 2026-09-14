import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Scoped to `next_auth` — that's the schema the real adapter/OTP routes
    // query (see supabase/migrations/001_auth_tables.sql), so this needs to
    // match it to reproduce the same result the live auth flow gets. Testing
    // the default `public` schema here would just report "relation does not
    // exist" instead of the real 406/PGRST106 ("schema must be one of the
    // following: public") that shows up in the Supabase logs when a schema
    // isn't in Project Settings → Data API → Exposed schemas.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { db: { schema: "next_auth" } }
    );

    const usersTest = await supabase.from("users").select("id").limit(1);
    results.usersTest = {
      error: usersTest.error,
      status: usersTest.status,
      statusText: usersTest.statusText,
      count: usersTest.data?.length ?? 0,
    };

    const accountsTest = await supabase.from("accounts").select("id").limit(1);
    results.accountsTest = {
      error: accountsTest.error,
      status: accountsTest.status,
      statusText: accountsTest.statusText,
    };

    const sessionsTest = await supabase.from("sessions").select("id").limit(1);
    results.sessionsTest = {
      error: sessionsTest.error,
      status: sessionsTest.status,
      statusText: sessionsTest.statusText,
    };

    results.envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
      jwtSecretLength: process.env.SUPABASE_JWT_SECRET?.length ?? 0,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasAuthUrl: !!process.env.AUTH_URL,
      authUrlValue: process.env.AUTH_URL ?? null,
    };
  } catch (e) {
    results.fatalError = e instanceof Error ? { message: e.message, stack: e.stack } : String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
