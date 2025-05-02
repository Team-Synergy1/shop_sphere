import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function GET() {
	try {
		await connectDB();

		// Fetch all active coupons that haven't expired
		const coupons = await Coupon.find({
			isActive: true,
			endDate: { $gte: new Date() },
		}).sort({ endDate: 1 }); // Sort by expiration date (soonest first)

		// Format coupon data for the frontend
		const formattedCoupons = coupons.map((coupon) => ({
			id: coupon._id.toString(),
			code: coupon.code,
			discountType: coupon.discountType,
			discountValue: coupon.discountValue,
			minPurchase: coupon.minPurchase,
			maxDiscount: coupon.maxDiscount,
			startDate: coupon.startDate,
			endDate: coupon.endDate,
			usageLimit: coupon.usageLimit,
			currentUsage: coupon.currentUsage,
			description: coupon.description,
			progress: coupon.usageLimit
				? Math.min(
						100,
						Math.round((coupon.currentUsage / coupon.usageLimit) * 100)
				  )
				: 0,
		}));

		return NextResponse.json(formattedCoupons);
	} catch (error) {
		console.error("Error fetching coupons:", error);
		return NextResponse.json(
			{ error: "Failed to fetch coupons" },
			{ status: 500 }
		);
	}
}
