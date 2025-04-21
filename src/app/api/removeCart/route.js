import { connectDB } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";

// Helper function to validate user session and get user data
async function getUserFromSession(session) {
	if (!session?.user) {
		return { error: "Unauthorized. Please log in.", status: 401 };
	}

	const user = await User.findById(session.user.id).select("cart role");

	if (!user) {
		return { error: "User not found.", status: 404 };
	}

	if (user.role === "vendor" || user.role === "admin") {
		return { error: "Only regular users can access cart", status: 403 };
	}

	return { user };
}

export async function POST(req) {
	try {
		await connectDB();
		const session = await getServerSession(authOptions);
		const userResult = await getUserFromSession(session);

		if (userResult.error) {
			return NextResponse.json(
				{ message: userResult.error },
				{ status: userResult.status }
			);
		}

		const { productId } = await req.json();
		if (!productId) {
			return NextResponse.json(
				{ message: "Product ID is required" },
				{ status: 400 }
			);
		}

		// Use atomic operation to remove item from cart
		const updatedUser = await User.findOneAndUpdate(
			{ _id: userResult.user._id },
			{ $pull: { cart: { _id: productId } } },
			{ new: true }
		);

		if (!updatedUser) {
			return NextResponse.json(
				{ message: "Failed to remove product from cart" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Product removed from cart successfully",
			cart: updatedUser.cart,
		});
	} catch (error) {
		console.error("Error removing product:", error);
		return NextResponse.json(
			{ message: "Error removing product", error: error.message },
			{ status: 500 }
		);
	}
}
