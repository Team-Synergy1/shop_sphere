// src/app/api/auth/debug/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
	try {
		// Try to get the current session
		const session = await getServerSession(authOptions);

		// Return debug information
		return NextResponse.json({
			status: "success",
			authenticated: !!session,
			session: session
				? {
						expires: session.expires,
						user: {
							name: session.user?.name,
							email: session.user?.email,
							// Don't include sensitive information
						},
				  }
				: null,
			nextAuthUrl: process.env.NEXTAUTH_URL,
			environment: process.env.NODE_ENV,
			// Include information about request headers
			googleOAuthConfigured:
				!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
		});
	} catch (error) {
		console.error("Auth debug API error:", error);
		return NextResponse.json(
			{
				status: "error",
				message: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : null,
			},
			{ status: 500 }
		);
	}
}
