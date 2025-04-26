import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		if (session.user.role !== "vendor") {
			return NextResponse.json(
				{ error: "Access denied. Vendor privileges required." },
				{ status: 403 }
			);
		}

		await connectDB();

		// Get vendor's products
		const vendorProducts = await Product.find({ vendor: session.user.id });
		const productIds = vendorProducts.map((product) => product._id);

		// Get all orders containing vendor's products that have reviews
		const orders = await Order.find({
			"items.product": { $in: productIds },
			"items.review": { $exists: true },
		}).populate([
			{
				path: "items.product",
				select: "name images price vendor",
			},
			{
				path: "user",
				select: "name email image",
			},
		]);

		// Process orders to get reviews for vendor's products
		const reviews = [];
		orders.forEach((order) => {
			const vendorItems = order.items.filter(
				(item) =>
					item.product && productIds.includes(item.product._id) && item.review
			);

			vendorItems.forEach((item) => {
				reviews.push({
					orderId: order._id,
					orderNumber: order.orderNumber,
					productId: item.product._id,
					productName: item.product.name,
					productImage: item.product.images[0],
					customer: {
						name: order.user.name,
						email: order.user.email,
						image: order.user.image,
					},
					rating: item.review.rating,
					comment: item.review.comment,
					createdAt: item.review.createdAt || order.createdAt,
				});
			});
		});

		// Sort reviews by date, most recent first
		reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return NextResponse.json({
			success: true,
			reviews,
		});
	} catch (error) {
		console.error("Error fetching reviews:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reviews" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		if (session.user.role !== "vendor") {
			return NextResponse.json(
				{ error: "Access denied. Vendor privileges required." },
				{ status: 403 }
			);
		}

		const data = await request.json();
		const { orderId, productId, response } = data;

		if (!orderId || !productId || !response) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		await connectDB();

		// Verify the product belongs to the vendor
		const product = await Product.findOne({
			_id: productId,
			vendor: session.user.id,
		});

		if (!product) {
			return NextResponse.json(
				{ error: "Product not found or not owned by vendor" },
				{ status: 404 }
			);
		}

		// Update the review with vendor's response
		const order = await Order.findOneAndUpdate(
			{
				_id: orderId,
				"items.product": productId,
			},
			{
				$set: {
					"items.$.review.vendorResponse": response,
					"items.$.review.vendorResponseDate": new Date(),
				},
			},
			{ new: true }
		);

		if (!order) {
			return NextResponse.json(
				{ error: "Order or review not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Response added successfully",
		});
	} catch (error) {
		console.error("Error updating review:", error);
		return NextResponse.json(
			{ error: "Failed to update review" },
			{ status: 500 }
		);
	}
}
