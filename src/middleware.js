import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
	const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });
	console.log("token:", token.role);
	const { pathname } = req.nextUrl;

	// Protect routes that require authentication
	if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/profile")) {
		if (!token) {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	// Protect admin routes
	if (pathname?.startsWith("/admin")) {
		if (!token || token.role !== "admin") {
			return NextResponse.redirect(new URL("/unauthorized", req.url));
		}
	}

	// Protect vendor routes
	if (pathname?.startsWith("/vendor")) {
		if (!token || token.role !== "vendor") {
			return NextResponse.redirect(new URL("/unauthorized", req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/admin/:path*",
		"/vendor/:path*",
		"/profile/:path*",
	],
};
