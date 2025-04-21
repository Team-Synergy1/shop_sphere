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

		const { productId, quantity } = await req.json();
		if (!productId || quantity === undefined) {
			return NextResponse.json(
				{ message: "Product ID and quantity are required" },
				{ status: 400 }
			);
		}

		// Use atomic update to modify the quantity of the specific cart item
		const updatedUser = await User.findOneAndUpdate(
			{
				_id: userResult.user._id,
				"cart._id": productId,
			},
			{
				$set: { "cart.$.quantity": quantity },
			},
			{ new: true }
		);

		if (!updatedUser) {
			return NextResponse.json(
				{ message: "Product not found in cart" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Cart updated successfully",
			cart: updatedUser.cart,
		});
	} catch (error) {
		console.error("Error updating cart:", error);
		return NextResponse.json(
			{ message: "Error updating cart", error: error.message },
			{ status: 500 }
		);
	}
}
