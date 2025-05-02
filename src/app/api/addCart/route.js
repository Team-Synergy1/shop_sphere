import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";

async function getUserFromSession(session, isPost = false) {
	if (!session?.user) {
		return { error: "Unauthorized. Please log in.", status: 401 };
	}

	const user = await User.findById(session.user.id).select("cart role");

	if (!user) {
		return { error: "User not found.", status: 404 };
	}

	return { user };
}

export async function POST(req) {
	try {
		await connectDB();
		const session = await getServerSession();
		
		console.log("Session in addCart:", session); // Add debugging for the session
		
		const userResult = await getUserFromSession(session, true);

		if (userResult.error) {
			return NextResponse.json(
				{ message: userResult.error },
				{ status: userResult.status }
			);
		}

		const user = userResult.user;
		const data = await req.json();

		// Handle multiple items case
		if (data.items && Array.isArray(data.items)) {
			let updatedCart = [...(user.cart || [])];

			// Process each item
			for (const product of data.items) {
				if (!product || !product._id) continue;

				const existingProductIndex = updatedCart.findIndex(
					(item) => item._id.toString() === product._id.toString()
				);

				if (existingProductIndex !== -1) {
					// Update quantity if product exists
					updatedCart[existingProductIndex].quantity =
						(updatedCart[existingProductIndex].quantity || 1) + 1;
				} else {
					// Add new product if it doesn't exist
					updatedCart.push({ ...product, quantity: 1 });
				}
			}

			// Update user's cart with all items
			const updatedUser = await User.findByIdAndUpdate(
				user._id,
				{ $set: { cart: updatedCart } },
				{ new: true }
			);

			if (!updatedUser) {
				return NextResponse.json(
					{ message: "Failed to update cart" },
					{ status: 500 }
				);
			}

			return NextResponse.json({
				message: "All items added to cart successfully",
				cart: updatedUser.cart,
			});
		}

		// Handle single item case
		const product = data;

		// Validate product data
		if (!product || !product._id) {
			return NextResponse.json(
				{ message: "Invalid product data" },
				{ status: 400 }
			);
		}

		// Initialize cart if it doesn't exist
		if (!user.cart || !Array.isArray(user.cart)) {
			const updatedUser = await User.findByIdAndUpdate(
				user._id,
				{ $set: { cart: [{ ...product, quantity: 1 }] } },
				{ new: true }
			).catch((err) => {
				console.error("Error updating user cart:", err);
				throw new Error("Failed to update cart");
			});

			if (!updatedUser) {
				return NextResponse.json(
					{ message: "Failed to update cart" },
					{ status: 500 }
				);
			}

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

		let updatedCart;
		if (existingProductIndex !== -1) {
			// Update quantity if product exists
			const newQuantity = user.cart[existingProductIndex].quantity + 1;
			user.cart[existingProductIndex].quantity = newQuantity;
			updatedCart = [...user.cart];
		} else {
			// Add new product if it doesn't exist
			updatedCart = [...user.cart, { ...product, quantity: 1 }];
		}

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ $set: { cart: updatedCart } },
			{ new: true }
		).catch((err) => {
			console.error("Error updating user cart:", err);
			throw new Error("Failed to update cart");
		});

		if (!updatedUser) {
			return NextResponse.json(
				{ message: "Failed to update cart" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			message: "Cart updated successfully",
			cart: updatedUser.cart,
			updated: existingProductIndex !== -1,
			quantity:
				existingProductIndex !== -1
					? updatedCart[existingProductIndex].quantity
					: 1,
		});
	} catch (error) {
		console.error("Error processing cart operation:", error);
		return NextResponse.json(
			{
				message: "Error processing cart operation",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		await connectDB();
		const session = await getServerSession();
		
		console.log("Session in GET addCart:", session); // Add debugging for the session
		
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
