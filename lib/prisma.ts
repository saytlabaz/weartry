import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7's generated client has no built-in "just connect from a
// DATABASE_URL string" mode anymore — it always needs an explicit driver
// adapter. PrismaPg wraps node-postgres (`pg`), which is what a plain
// Postgres connection string (this project's Supabase Postgres) needs.
function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // DATABASE_URL currently points at Supabase's Session pooler, which caps
  // total concurrent connections at 15 across every client — and each
  // serverless function instance gets its own pool here (node-postgres
  // defaults to `max: 10`), so a handful of concurrent instances alone
  // exhausts it ("max clients reached in session mode"), independent of
  // real traffic volume. Capping each instance's own pool is a stopgap;
  // the real fix is moving DATABASE_URL to Supabase's Transaction pooler
  // (port 6543), which is built for exactly this many-short-lived-clients
  // shape instead of a fixed session-per-client budget.
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 3 }) });
}

// Lazy for the same reason lib/supabase/admin.ts's client is: a missing
// DATABASE_URL should only throw when a request actually reaches a route
// that needs the DB, not whenever this module is merely imported (e.g.
// during `next build`'s page-data collection, before env vars are
// necessarily available). Also reuses one client across dev hot-reloads —
// otherwise `next dev` recreating this module on every edit would open a
// fresh pool of DB connections each time until they're exhausted.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient() as object, prop, receiver);
  },
});
