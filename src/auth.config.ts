import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
  callbacks: {
    // 🚀 Crucial: Allow public browsing so visitors can see the landing page.
    // Your middleware.ts will handle protecting /studio and /hq.
    authorized() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
