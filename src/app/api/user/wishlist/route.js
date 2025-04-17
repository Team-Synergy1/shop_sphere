import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to validate user session and get user data
async function getUserFromSession(session) {
	if (!session?.user) {
		return { error: "Unauthorized. Please log in.", status: 401 };
	}

	const user = await User.findOne({ email: session.user.email }).select(
		"wishlist role"
	);

	if (!user) {
		return { error: "User not found.", status: 404 };
	}

	return { user };
}

export async function GET(request) {
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

		const wishlistIds = userResult.user.wishlist || [];

		// Fetch product details in a single query
		const wishlistItems = await Product.find({
			_id: { $in: wishlistIds },
		}).select("name price images stock");

		return NextResponse.json({ wishlist: wishlistItems });
	} catch (error) {
		console.error("Fetch wishlist error:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
