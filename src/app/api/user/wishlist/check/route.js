// src/app/api/user/wishlist/check/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Helper function to validate user session and get user data
async function getUserFromSession(session) {
	if (!session?.user) {
		return { error: "Unauthorized. Please log in.", status: 401 };
	}

	const user = await User.findOne({ email: session.user.email }).select(
		"wishlist"
	);

	if (!user) {
		return { error: "User not found.", status: 404 };
	}

	return { user };
}

export async function POST(request) {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);
		const userResult = await getUserFromSession(session);

		if (userResult.error) {
			return NextResponse.json(
				{ error: userResult.error },
				{ status: userResult.status }
			);
		}

		const { productId } = await request.json();
		if (!productId) {
			return NextResponse.json(
				{ error: "Product ID is required" },
				{ status: 400 }
			);
		}

		const isInWishlist =
			userResult.user.wishlist?.some(
				(id) => id.toString() === productId.toString()
			) || false;

		return NextResponse.json({ isInWishlist });
	} catch (error) {
		console.error("Check wishlist error:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
