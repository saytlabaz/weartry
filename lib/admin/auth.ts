import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { checkBlocked, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";

const ATTEMPT_TYPE = "admin_login";

class BlockedError extends CredentialsSignin {
  code = "blocked";
}

/**
 * A second, independent NextAuth instance from the shopper-facing one in
 * auth.ts — separate AdminUser table, separate (shorter) session, and its
 * own cookie name so the two never collide or get confused for each other
 * in the browser.
 */
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const { blocked } = await checkBlocked(email, ATTEMPT_TYPE);
        if (blocked) throw new BlockedError();

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin) {
          await recordFailedAttempt(email, ATTEMPT_TYPE);
          return null;
        }

        const valid = await verifyPassword(password, admin.passwordHash);
        if (!valid) {
          await recordFailedAttempt(email, ATTEMPT_TYPE);
          return null;
        }

        await clearAttempts(email, ATTEMPT_TYPE);
        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Short-lived on purpose — this is a single-admin account with no 2FA.
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/idarepaneli/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "admin-session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}));
