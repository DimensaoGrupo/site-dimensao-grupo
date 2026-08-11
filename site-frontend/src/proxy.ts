import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic UX redirect only — cheap cookie-presence check, no JWT verify.
// The real authorization check happens in src/app/admin/(protected)/layout.tsx
// and inside every admin Server Action (src/lib/auth/session.ts —
// requireSession/requireSessionOrRedirect), since a routing change here
// could otherwise silently drop protection.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("admin_session");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
