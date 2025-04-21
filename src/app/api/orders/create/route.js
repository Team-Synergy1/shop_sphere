import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Stripe from "stripe";

import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		await connectDB();
		const user = await User.findById(session.user.id).populate("cart");

		if (!user?.cart?.length) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const { paymentMethod, isCashOnDelivery, sessionId } = await request.json();

		let formattedItems = [];
		let totalAmount = 0;

		if (isCashOnDelivery) {
			// For COD orders, use cart items directly
			formattedItems = user.cart.map((item) => ({
				product: item._id,
				name: item.name,
				price: item.price,
				quantity: item.quantity || 1,
				subtotal: item.price * (item.quantity || 1),
			}));

			totalAmount = formattedItems.reduce(
				(sum, item) => sum + item.subtotal,
				0
			);
		} else {
			// For Stripe payments, verify the session
			if (!sessionId) {
				return NextResponse.json(
					{ error: "Session ID is required" },
					{ status: 400 }
				);
			}

			const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
			if (stripeSession.payment_status !== "paid") {
				return NextResponse.json(
					{ error: "Payment not completed" },
					{ status: 400 }
				);
			}

			const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
			formattedItems = lineItems.data.map((item) => ({
				product: new mongoose.Types.ObjectId(),
				name: item.description,
				price: item.price.unit_amount / 100,
				quantity: item.quantity,
				subtotal: (item.price.unit_amount / 100) * item.quantity,
			}));

			totalAmount = formattedItems.reduce(
				(sum, item) => sum + item.subtotal,
				0
			);
		}

		// Generate order number
		const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		// Get user's address
		const userWithAddresses = await User.findById(session.user.id).select(
			"addresses"
		);
		const defaultAddress =
			userWithAddresses.addresses.find((addr) => addr.isDefault) ||
			userWithAddresses.addresses[0];

		if (!defaultAddress) {
			return NextResponse.json(
				{ error: "No shipping address found" },
				{ status: 400 }
			);
		}

		// Create the order
		const order = new Order({
			user: user._id,
			orderNumber: orderNumber,
			items: formattedItems,
			totalAmount: totalAmount,
			shippingAddress: {
				street: defaultAddress.street,
				city: defaultAddress.city,
				state: defaultAddress.state,
				postalCode: defaultAddress.postalCode,
				country: defaultAddress.country,
			},
			paymentMethod: paymentMethod,
			paymentStatus: isCashOnDelivery ? "pending" : "paid",
			status: "processing",
		});

		await order.save();

		// Clear the user's cart
		user.cart = [];
		await user.save();

		return NextResponse.json({
			success: true,
			message: "Order created successfully",
			orderNumber: order.orderNumber,
			order: order,
		});
	} catch (error) {
		console.error("Create order error:", error);
		return NextResponse.json(
			{ error: `Error creating order: ${error.message}` },
			{ status: 500 }
		);
	}
}
