import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "pt_session";

/**
 * Snelle eerste controle: zonder sessiecookie direct naar /login. De sessie
 * zelf wordt server-side gevalideerd (zie `requireUser` in src/lib/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/cron/")
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api/health).*)"],
};
