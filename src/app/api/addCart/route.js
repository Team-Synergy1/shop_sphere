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

		const product = await req.json();
		const user = userResult.user;

		// Initialize cart if it doesn't exist
		if (!user.cart || !Array.isArray(user.cart)) {
			const updatedUser = await User.findByIdAndUpdate(
				user._id,
				{ $set: { cart: [{ ...product, quantity: 1 }] } },
				{ new: true }
			);

			return NextResponse.json({
				message: "Product added to cart successfully",
				cart: updatedUser.cart,
				updated: false,
				quantity: 1,
			});
		}

		// Check if product already exists in cart
		const existingProductIndex = user.cart.findIndex(
			(item) => item._id.toString() === product._id.toString()
		);

		if (existingProductIndex !== -1) {
			// Update quantity of existing product
			const currentQuantity = user.cart[existingProductIndex].quantity || 1;
			const newQuantity = currentQuantity + 1;
			user.cart[existingProductIndex].quantity = newQuantity;

			const updatedUser = await User.findByIdAndUpdate(
				user._id,
				{ $set: { cart: user.cart } },
				{ new: true }
			);

			return NextResponse.json({
				message: "Product quantity updated in cart",
				cart: updatedUser.cart,
				updated: true,
				quantity: newQuantity,
			});
		} else {
			// Add new product to cart
			const updatedUser = await User.findByIdAndUpdate(
				user._id,
				{ $push: { cart: { ...product, quantity: 1 } } },
				{ new: true }
			);

			return NextResponse.json({
				message: "Product added to cart successfully",
				cart: updatedUser.cart,
				updated: false,
				quantity: 1,
			});
		}
	} catch (error) {
		console.error("Error saving product:", error);
		return NextResponse.json(
			{ message: "Error saving product", error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET() {
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

		return NextResponse.json({
			message: "Cart fetched successfully",
			cart: userResult.user.cart || [],
		});
	} catch (error) {
		console.error("Error fetching cart:", error);
		return NextResponse.json(
			{ message: "Error fetching cart", error: error.message },
			{ status: 500 }
		);
	}
}
