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

		const { sessionId } = await request.json();
		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		await connectDB();

		const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
		console.log("Stripe session:", stripeSession);
		if (stripeSession.payment_status !== "paid") {
			return NextResponse.json(
				{ error: "Payment not completed" },
				{ status: 400 }
			);
		}

		const user = await User.findById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (!user.cart || user.cart.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
		const used = await User.findById(session.user.id).select("addresses");
		console.log("User address:", used);

		const formattedItems = [];
		for (const item of lineItems.data) {
			const productName = item.description;
			const productPrice = item.price.unit_amount / 100;
			const quantity = item.quantity;

			formattedItems.push({
				product: new mongoose.Types.ObjectId(),
				name: productName,
				price: productPrice,
				quantity: quantity,
				subtotal: productPrice * quantity,
			});
		}

		const totalAmount = formattedItems.reduce(
			(sum, item) => sum + item.subtotal,
			0
		);

		const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		// Find the default address or use the first one
		const defaultAddress =
			used.addresses.find((addr) => addr.isDefault) || used.addresses[0];

		// Create shipping address safely
		const shippingAddress = {
			street: defaultAddress?.street || "Not provided",
			city: defaultAddress?.city || "Not provided",
			state: defaultAddress?.state || "Not provided",
			postalCode: defaultAddress?.postalCode || "Not provided",
			country: defaultAddress?.country || "Not provided",
		};

		const order = new Order({
			user: user._id,
			orderNumber: orderNumber,
			items: formattedItems,
			totalAmount: totalAmount,
			shippingAddress: shippingAddress,
			paymentMethod: "card",
			paymentStatus: "paid",
			status: "processing",
		});

		await order.save();

		user.cart = [];
		await user.save();

		return NextResponse.json({
			success: true,
			message: "Order created successfully",
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
