import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabaseNextAuth } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

// A plain `throw new Error("BLOCKED")` inside authorize() would NOT reach the
// client as "BLOCKED" — Auth.js only forwards the `.type`/`.code` of errors
// it recognizes as "client-safe" (CredentialsSignin and a short allowlist);
// anything else collapses into a generic `error=Configuration` page (the
// exact bug Google hit earlier when the adapter itself was misconfigured).
// Subclassing CredentialsSignin with a distinct `code` is the supported way
// to get a specific reason back to the client via signIn()'s `code` field.
class BlockedError extends CredentialsSignin {
  code = "blocked";
}

// Config is built lazily (per request) rather than at module scope so that
// SupabaseAdapter's createClient() call — which throws synchronously when
// its URL/key are missing — only runs when a request actually needs auth,
// not whenever this module is imported (e.g. during `next build`'s static
// page-data collection, before env vars are necessarily available).
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  // Vercel (and other reverse-proxy hosts) terminate TLS in front of the
  // app, so Auth.js can't verify the host itself from the raw request —
  // without this it refuses to trust the forwarded host/proto headers.
  trustHost: true,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const { blocked } = await checkBlocked(email, "login_password");
        if (blocked) throw new BlockedError();

        const { data: user } = await supabaseNextAuth.from("users").select("*").eq("email", email).maybeSingle();

        if (!user || !user.password_hash) {
          await recordFailedAttempt(email, "login_password");
          return null;
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
          await recordFailedAttempt(email, "login_password");
          return null;
        }

        await clearAttempts(email, "login_password");
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  // Credentials-authenticated sessions can't use Auth.js's database session
  // strategy (there's no OAuth-style adapter flow backing them), so the
  // whole instance runs on JWT sessions once Credentials is registered —
  // Google sign-in is unaffected functionally, its session is just now a
  // signed cookie instead of a `next_auth.sessions` row.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
    // updateAge defolt olaraq 24 saatdır: istifadəçi 24 saatdan tez-tez
    // ziyarət etdikcə cookie-nin vaxtı hər dəfə yenidən 30 günə uzadılır —
    // yəni aktiv istifadəçi üçün sessiya faktiki müddətsizdir.
  },
  pages: {
    signIn: "/account/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;
      // JWT sessions cache name/email/picture in the signed cookie itself,
      // so changing them in the account panel wouldn't show up anywhere
      // that reads the session until next login — unless we re-read the
      // row here whenever the client explicitly asks for a refresh via
      // useSession().update() (trigger === "update").
      if (trigger === "update" && token.id) {
        const { data } = await supabaseNextAuth
          .from("users")
          .select("name, email, image")
          .eq("id", token.id)
          .maybeSingle();
        if (data) {
          token.name = data.name;
          token.email = data.email;
          token.picture = data.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
}));
