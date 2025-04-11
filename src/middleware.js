import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {

	const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });

	const { pathname } = req.nextUrl;

  
  
  if (token) {
    console.log("token:", token.role);
  } else {
    console.log("No token found");
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

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/profile/:path*",
	],
};

 
//   if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/profile")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }
