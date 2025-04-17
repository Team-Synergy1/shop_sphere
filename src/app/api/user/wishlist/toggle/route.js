import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

		const user = userResult.user;
		if (!user.wishlist) {
			user.wishlist = [];
		}

		const inWishlist = user.wishlist.includes(productId);

		// Use atomic update operation
		const updatedUser = await User.findOneAndUpdate(
			{ email: session.user.email },
			inWishlist
				? { $pull: { wishlist: productId } }
				: { $addToSet: { wishlist: productId } },
			{ new: true }
		);

		return NextResponse.json({
			inWishlist: !inWishlist,
			message: inWishlist ? "Removed from wishlist" : "Added to wishlist",
			wishlistCount: updatedUser.wishlist.length,
		});
	} catch (error) {
		console.error("Toggle wishlist error:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
