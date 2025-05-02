import { connectDB } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import mongoose from "mongoose";

// Helper function to validate user session and get user data
async function getUserFromSession(session) {
	if (!session?.user) {
		return { error: "Unauthorized. Please log in.", status: 401 };
	}

	const user = await User.findById(session.user.id).select("cart role");

	if (!user) {
		return { error: "User not found.", status: 404 };
	}

	// Remove this check to allow all users to access their cart
	// if (user.role === "vendor" || user.role === "admin") {
	// 	return { error: "Only regular users can access cart", status: 403 };
	// }

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

		const user = userResult.user;

		// Improved product ID comparison to handle both string and ObjectId formats
		let productIdToRemove = productId;
		// Convert to ObjectId if it's a valid ObjectId string
		if (mongoose.Types.ObjectId.isValid(productId)) {
			productIdToRemove = new mongoose.Types.ObjectId(productId);
		}

		// Find the cart item with the matching product ID
		const cartItemIndex = user.cart.findIndex(
			(item) =>
				item._id.toString() === productId.toString() ||
				item._id.equals?.(productIdToRemove)
		);

		if (cartItemIndex === -1) {
			return NextResponse.json(
				{ message: "Product not found in cart" },
				{ status: 404 }
			);
		}

		// Remove the item from the cart array
		user.cart.splice(cartItemIndex, 1);

		// Save the updated user document
		await user.save();

		return NextResponse.json({
			message: "Product removed from cart successfully",
			cart: user.cart,
		});
	} catch (error) {
		console.error("Error removing product:", error);
		return NextResponse.json(
			{ message: "Error removing product", error: error.message },
			{ status: 500 }
		);
	}
}
