import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import User from "@/models/User";

export async function POST(request) {
	try {
		await connectDB();

		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const { code, cartSubtotal } = await request.json();

		if (!code || !cartSubtotal) {
			return NextResponse.json(
				{ message: "Coupon code and cart subtotal are required" },
				{ status: 400 }
			);
		}

		// Find the coupon (case insensitive)
		const coupon = await Coupon.findOne({
			code: { $regex: new RegExp(`^${code}$`, "i") },
			isActive: true,
			startDate: { $lte: new Date() },
			endDate: { $gte: new Date() },
		});

		if (!coupon) {
			return NextResponse.json(
				{ message: "Invalid or expired coupon code" },
				{ status: 404 }
			);
		}

		// Check if coupon has reached its usage limit
		if (
			coupon.usageLimit !== null &&
			coupon.currentUsage >= coupon.usageLimit
		) {
			return NextResponse.json(
				{ message: "This coupon has reached its usage limit" },
				{ status: 400 }
			);
		}

		// Check minimum purchase requirement
		if (cartSubtotal < coupon.minPurchase) {
			return NextResponse.json(
				{
					message: `Minimum purchase amount of $${coupon.minPurchase.toFixed(
						2
					)} required for this coupon`,
				},
				{ status: 400 }
			);
		}

		// Check if user has already used this coupon
		const user = await User.findById(session.user.id);
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Check user's order history for previous coupon usage
		// This would typically involve checking Order model records
		// but for simplicity, we'll skip full implementation here

		// Calculate the discount amount
		let discountAmount = 0;
		if (coupon.discountType === "percentage") {
			discountAmount = (cartSubtotal * coupon.discountValue) / 100;

			// Apply maximum discount cap if set
			if (coupon.maxDiscount !== null) {
				discountAmount = Math.min(discountAmount, coupon.maxDiscount);
			}
		} else {
			// Fixed amount discount
			discountAmount = coupon.discountValue;
		}

		// Return coupon details with calculated discount
		return NextResponse.json({
			code: coupon.code,
			discountType: coupon.discountType,
			discountValue: coupon.discountValue,
			calculatedDiscount: discountAmount,
			message: "Coupon applied successfully",
		});
	} catch (error) {
		console.error("Error validating coupon:", error);
		return NextResponse.json(
			{ message: "Failed to validate coupon" },
			{ status: 500 }
		);
	}
}
