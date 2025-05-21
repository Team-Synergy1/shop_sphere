import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

// GET a specific coupon by ID (admin only)
export async function GET(request, { params }) {
	try {
		await connectDB();

		// Verify admin role
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized: Admin access required" },
				{ status: 403 }
			);
		}

		const couponId = params.id;

		// Find the coupon
		const coupon = await Coupon.findById(couponId);

		if (!coupon) {
			return NextResponse.json(
				{ message: "Coupon not found" },
				{ status: 404 }
			);
		}

		// Format and return coupon data
		return NextResponse.json({
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
		});
	} catch (error) {
		console.error("Error fetching coupon:", error);
		return NextResponse.json(
			{ message: "Error fetching coupon" },
			{ status: 500 }
		);
	}
}

// PUT: Update a coupon by ID (admin only)
export async function PUT(request, { params }) {
	try {
		await connectDB();

		// Verify admin role
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized: Admin access required" },
				{ status: 403 }
			);
		}

		const couponId = params.id;
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

		// Find the coupon to update
		const coupon = await Coupon.findById(couponId);

		if (!coupon) {
			return NextResponse.json(
				{ message: "Coupon not found" },
				{ status: 404 }
			);
		}

		// Check if the new code conflicts with existing coupons (except this one)
		if (data.code !== coupon.code) {
			const existingCoupon = await Coupon.findOne({
				code: { $regex: new RegExp(`^${data.code}$`, "i") },
				_id: { $ne: couponId },
			});

			if (existingCoupon) {
				return NextResponse.json(
					{ message: "Coupon code already exists" },
					{ status: 409 }
				);
			}
		}

		// Prepare update data
		const updateData = {
			code: data.code.toUpperCase(),
			discountType: data.discountType,
			discountValue: parseFloat(data.discountValue),
			minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : 0,
			endDate: new Date(data.endDate),
			description: data.description || "",
		};

		// Optional fields
		if (data.startDate) {
			updateData.startDate = new Date(data.startDate);
		}

		if (data.maxDiscount && data.discountType === "percentage") {
			updateData.maxDiscount = parseFloat(data.maxDiscount);
		} else if (data.discountType !== "percentage") {
			// If not percentage type, remove max discount
			updateData.maxDiscount = undefined;
		}

		if (data.usageLimit) {
			updateData.usageLimit = parseInt(data.usageLimit);
		}

		// Update the coupon
		const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
			new: true,
		});

		return NextResponse.json({
			message: "Coupon updated successfully",
			coupon: {
				id: updatedCoupon._id.toString(),
				code: updatedCoupon.code,
			},
		});
	} catch (error) {
		console.error("Error updating coupon:", error);
		return NextResponse.json(
			{ message: "Error updating coupon" },
			{ status: 500 }
		);
	}
}

// DELETE: Delete a coupon by ID (admin only)
export async function DELETE(request, { params }) {
	try {
		await connectDB();

		// Verify admin role
		const session = await getServerSession(authOptions);
		if (!session || session.user?.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized: Admin access required" },
				{ status: 403 }
			);
		}

		const couponId = params.id;

		// Find and delete the coupon
		const coupon = await Coupon.findByIdAndDelete(couponId);

		if (!coupon) {
			return NextResponse.json(
				{ message: "Coupon not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Coupon deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting coupon:", error);
		return NextResponse.json(
			{ message: "Error deleting coupon" },
			{ status: 500 }
		);
	}
}
