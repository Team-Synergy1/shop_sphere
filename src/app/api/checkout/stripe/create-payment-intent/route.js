import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Stripe from "stripe";

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

		// Calculate total amount
		const totalAmount = user.cart.reduce(
			(sum, item) => sum + item.price * (item.quantity || 1),
			0
		);

		// Create PaymentIntent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(totalAmount * 100), // Convert to cents
			currency: "bdt",
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				userId: user._id.toString(),
			},
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error("Create payment intent error:", error);
		return NextResponse.json(
			{ error: "Error creating payment intent" },
			{ status: 500 }
		);
	}
}
