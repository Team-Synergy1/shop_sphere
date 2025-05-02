import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET all coupons (admin only)
export async function GET(request) {
	try {
		await connectDB();

		// Verify admin role - Fixed to include authOptions
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Not authenticated" },
				{ status: 401 }
			);
		}

		// Add debugging to see user role
		console.log("User session:", session.user?.role); 

		if (session.user?.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized: Admin access required" },
				{ status: 403 }
			);
		}

		// Fetch all coupons
		const coupons = await Coupon.find().sort({ createdAt: -1 });

		// Format coupon data
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
			isActive: coupon.isActive,
			description: coupon.description,
			createdAt: coupon.createdAt,
		}));

		return NextResponse.json(formattedCoupons);
	} catch (error) {
		console.error("Error fetching coupons:", error);
		return NextResponse.json(
			{ message: "Error fetching coupons", error: error.message },
			{ status: 500 }
		);
	}
}

// POST: Create a new coupon (admin only)
export async function POST(request) {
	try {
		await connectDB();

		// Verify admin role - Fixed to include authOptions
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Not authenticated" },
				{ status: 401 }
			);
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized: Admin access required" },
				{ status: 403 }
			);
		}

		// Parse request body
		const data = await request.json();

		// Validate required fields
		if (
			!data.code ||
			!data.discountType ||
			!data.discountValue ||
			!data.endDate
		) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check if coupon code already exists (case insensitive)
		const existingCoupon = await Coupon.findOne({
			code: { $regex: new RegExp(`^${data.code}$`, "i") },
		});

		if (existingCoupon) {
			return NextResponse.json(
				{ message: "Coupon code already exists" },
				{ status: 409 }
			);
		}

		// Prepare coupon data
		const couponData = {
			code: data.code.toUpperCase(),
			discountType: data.discountType,
			discountValue: parseFloat(data.discountValue),
			minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : 0,
			isActive: true,
			currentUsage: 0,
			endDate: new Date(data.endDate),
			description: data.description || "",
		};

		// Optional fields
		if (data.startDate) {
			couponData.startDate = new Date(data.startDate);
		} else {
			couponData.startDate = new Date(); // Default to current date
		}

		if (data.maxDiscount && data.discountType === "percentage") {
			couponData.maxDiscount = parseFloat(data.maxDiscount);
		}

		if (data.usageLimit) {
			couponData.usageLimit = parseInt(data.usageLimit);
		}

		// Create coupon
		const newCoupon = await Coupon.create(couponData);

		return NextResponse.json(
			{
				message: "Coupon created successfully",
				coupon: {
					id: newCoupon._id.toString(),
					code: newCoupon.code,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating coupon:", error);
		return NextResponse.json(
			{ message: "Error creating coupon" },
			{ status: 500 }
		);
	}
}
