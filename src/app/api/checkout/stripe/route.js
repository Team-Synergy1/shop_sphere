import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
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

		// Create line items from cart
		const lineItems = await Promise.all(
			user.cart.map(async (item) => {
				const product = await Product.findById(item._id);
				return {
					price_data: {
						currency: "usd",
						product_data: {
							name: product.name,
							images: [product.image],
							description: product.description,
						},
						unit_amount: Math.round(product.price * 100), // Convert to cents
					},
					quantity: item.quantity || 1,
				};
			})
		);

		// Create Stripe checkout session
		const stripeSession = await stripe.checkout.sessions.create({
			customer_email: user.email,
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
			metadata: {
				userId: user._id.toString(),
			},
		});

		return NextResponse.json({ id: stripeSession.id });
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return NextResponse.json(
			{ error: "Error creating checkout session" },
			{ status: 500 }
		);
	}
}
