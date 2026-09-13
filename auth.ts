import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

// Config is built lazily (per request) rather than at module scope so that
// SupabaseAdapter's createClient() call — which throws synchronously when
// its URL/key are missing — only runs when a request actually needs auth,
// not whenever this module is imported (e.g. during `next build`'s static
// page-data collection, before env vars are necessarily available).
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/account/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
}));
