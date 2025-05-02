import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
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

		const { paymentMethod, isCashOnDelivery, sessionId, couponCode } =
			await request.json();

		// Check stock availability and update products
		for (const item of user.cart) {
			const product = await Product.findById(item._id);
			if (!product) {
				return NextResponse.json(
					{ error: `Product ${item._id} not found` },
					{ status: 404 }
				);
			}
			if (product.stock < (item.quantity || 1)) {
				return NextResponse.json(
					{
						error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
						productId: product._id,
					},
					{ status: 400 }
				);
			}
		}

		let formattedItems = [];
		let subtotalAmount = 0;

		// Update stock and format order items
		for (const item of user.cart) {
			const product = await Product.findById(item._id);

			// Deduct stock
			const newStock = product.stock - (item.quantity || 1);
			await Product.findByIdAndUpdate(item._id, {
				stock: newStock,
				inStock: newStock > 0,
			});

			formattedItems.push({
				product: item._id,
				name: item.name,
				price: item.price,
				quantity: item.quantity || 1,
				subtotal: item.price * (item.quantity || 1),
			});

			subtotalAmount += item.price * (item.quantity || 1);
		}

		// Handle coupon if provided
		let discountAmount = 0;
		let appliedCoupon = null;

		if (couponCode) {
			// Find and validate the coupon
			const coupon = await Coupon.findOne({
				code: { $regex: new RegExp(`^${couponCode}$`, "i") },
				isActive: true,
				startDate: { $lte: new Date() },
				endDate: { $gte: new Date() },
			});

			if (coupon) {
				// Check minimum purchase requirement
				if (subtotalAmount >= coupon.minPurchase) {
					// Calculate discount
					if (coupon.discountType === "percentage") {
						discountAmount = (subtotalAmount * coupon.discountValue) / 100;

						// Apply maximum discount cap if set
						if (coupon.maxDiscount !== null) {
							discountAmount = Math.min(discountAmount, coupon.maxDiscount);
						}
					} else {
						// Fixed amount discount
						discountAmount = Math.min(coupon.discountValue, subtotalAmount);
					}

					// Update coupon usage
					coupon.currentUsage += 1;
					await coupon.save();

					appliedCoupon = {
						code: coupon.code,
						discountType: coupon.discountType,
						discountValue: coupon.discountValue,
						discountAmount: discountAmount,
					};
				}
			}
		}

		// Calculate final amount after discount
		const totalAmount = Math.max(subtotalAmount - discountAmount, 0);

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
			subtotalAmount: subtotalAmount,
			discountAmount: discountAmount,
			totalAmount: totalAmount,
			coupon: appliedCoupon
				? {
						code: appliedCoupon.code,
						discountType: appliedCoupon.discountType,
						discountValue: appliedCoupon.discountValue,
						discountAmount: appliedCoupon.discountAmount,
				  }
				: null,
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
			id: order._id,
			discount: discountAmount,
			total: totalAmount,
		});
	} catch (error) {
		console.error("Create order error:", error);
		return NextResponse.json(
			{ error: `Error creating order: ${error.message}` },
			{ status: 500 }
		);
	}
}
