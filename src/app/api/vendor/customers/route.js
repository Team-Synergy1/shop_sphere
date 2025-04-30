import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

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
		const vendorProducts = await Product.find({ v_id: session.user.id });
		const productIds = vendorProducts.map((product) => product._id);

		// Get all orders containing vendor's products
		const orders = await Order.find({
			"items.product": { $in: productIds },
		}).populate("user");

		// Process orders to get customer data
		const customerMap = new Map();

		orders.forEach((order) => {
			if (!order.user) return;

			const userId = order.user._id.toString();
			const vendorItems = order.items.filter(
				(item) => item.product && productIds.includes(item.product._id)
			);

			const orderTotal = vendorItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			if (!customerMap.has(userId)) {
				customerMap.set(userId, {
					_id: order.user._id,
					name: order.user.name,
					email: order.user.email,
					orderCount: 0,
					totalSpent: 0,
					lastOrder: null,
					firstOrder: order.createdAt,
				});
			}

			const customer = customerMap.get(userId);
			customer.orderCount++;
			customer.totalSpent += orderTotal;

			// Update last order date if this order is more recent
			if (!customer.lastOrder || order.createdAt > customer.lastOrder) {
				customer.lastOrder = order.createdAt;
			}
		});

		// Convert map to array and sort by most recent order
		const customers = Array.from(customerMap.values()).sort(
			(a, b) => b.lastOrder - a.lastOrder
		);

		return NextResponse.json({
			success: true,
			customers,
		});
	} catch (error) {
		console.error("Error fetching customers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch customers" },
			{ status: 500 }
		);
	}
}
