import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // 🚀 Import from the new Edge-safe file
import { NextResponse } from "next/server";

// 🚀 Initialize NextAuth strictly with the Edge-compatible config
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isHQRoute = nextUrl.pathname.startsWith("/hq");
  const isStudioRoute = nextUrl.pathname.startsWith("/studio");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // ==========================================
  // 1. AUTH ROUTES (Login/Register)
  // ==========================================
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // ==========================================
  // 2. STUDIO SECURITY (Organizers Only)
  // ==========================================
  if (isStudioRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl),
      );
    }

    const allowedStudioRoles = ["ORGANIZER", "SUPER_ADMIN", "SUPERVISOR"];
    if (!allowedStudioRoles.includes(userRole as string)) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // ==========================================
  // 3. HQ COMMAND CENTER (Staff Only)
  // ==========================================
  if (isHQRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl),
      );
    }

    const allowedHQRoles = ["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"];
    if (!allowedHQRoles.includes(userRole as string)) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
