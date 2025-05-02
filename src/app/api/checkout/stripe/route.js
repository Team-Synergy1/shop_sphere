import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
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

		// Get the request body to check for coupon code
		const { couponCode } = await request.json();

		// Calculate cart total
		let subtotal = 0;
		user.cart.forEach((item) => {
			subtotal += item.price * (item.quantity || 1);
		});

		// Process coupon if provided
		let discountAmount = 0;
		let couponDetails = null;

		if (couponCode) {
			// Find and validate the coupon
			const coupon = await Coupon.findOne({
				code: { $regex: new RegExp(`^${couponCode}$`, "i") },
				isActive: true,
				startDate: { $lte: new Date() },
				endDate: { $gte: new Date() },
			});

			if (coupon && subtotal >= coupon.minPurchase) {
				// Calculate discount
				if (coupon.discountType === "percentage") {
					discountAmount = (subtotal * coupon.discountValue) / 100;

					// Apply maximum discount cap if set
					if (coupon.maxDiscount !== null) {
						discountAmount = Math.min(discountAmount, coupon.maxDiscount);
					}
				} else {
					// Fixed amount discount
					discountAmount = Math.min(coupon.discountValue, subtotal);
				}

				// Update coupon usage (we'll do this after successful payment in webhook)
				couponDetails = {
					id: coupon._id.toString(),
					code: coupon.code,
					discountType: coupon.discountType,
					discountValue: coupon.discountValue,
					discountAmount: discountAmount,
				};
			}
		}

		// Calculate final amount
		const totalAmount = Math.max(subtotal - discountAmount, 0);

		// Create line items from cart
		const lineItems = await Promise.all(
			user.cart.map(async (item) => {
				const product = await Product.findById(item._id);
				return {
					price_data: {
						currency: "bdt",
						product_data: {
							name: product.name,
							images:
								product.images && product.images.length > 0
									? [product.images[0]]
									: [],
							description: product.description || product.name,
						},
						unit_amount: Math.round(product.price * 100), // Convert to cents
					},
					quantity: item.quantity || 1,
				};
			})
		);

		// Add discount as a separate line item if applicable
		if (discountAmount > 0) {
			lineItems.push({
				price_data: {
					currency: "bdt",
					product_data: {
						name: `Discount: ${couponDetails.code}`,
						description: `${
							couponDetails.discountType === "percentage"
								? `${couponDetails.discountValue}% off`
								: "Fixed amount discount"
						}`,
					},
					unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
				},
				quantity: 1,
			});
		}

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
				subtotal: subtotal.toString(),
				discountAmount: discountAmount.toString(),
				totalAmount: totalAmount.toString(),
				couponCode: couponDetails?.code || "",
				couponId: couponDetails?.id || "",
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
