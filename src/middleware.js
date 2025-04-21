import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });
    const { pathname, search, origin } = req.nextUrl;

    // If trying to access protected routes without auth
    if (!token) {
      if (pathname.startsWith("/dashboard/user") || pathname.startsWith("/cart")) {
        const returnUrl = pathname + search;
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("callbackUrl", returnUrl);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Protect admin routes
    if (pathname?.startsWith("/dashboard/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Protect vendor routes
    if (pathname?.startsWith("/dashboard/vendor")) {
      if (!token || token.role !== "vendor") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Protect user routes
    if (pathname?.startsWith("/dashboard/user")) {
      if (!token || token.role !== "user") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    const response = NextResponse.next();
    // Add Cache-Control header to prevent compression issues
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/cart/:path*"]
};
