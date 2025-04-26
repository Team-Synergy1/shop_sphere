import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request, { params }) {
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
		const { id } = params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: "Invalid customer ID" },
				{ status: 400 }
			);
		}

		// Get vendor's products
		const vendorProducts = await Product.find({ v_id: session.user.id });
		const productIds = vendorProducts.map((product) => product._id);

		// Get the customer
		const customer = await User.findById(id);
		if (!customer) {
			return NextResponse.json(
				{ error: "Customer not found" },
				{ status: 404 }
			);
		}

		// Get all orders from this customer containing vendor's products
		const orders = await Order.find({
			user: id,
			"items.product": { $in: productIds },
		}).populate("items.product");

		// Process orders to get customer statistics
		let totalSpent = 0;
		let firstOrder = null;
		let lastOrder = null;

		const processedOrders = orders.map((order) => {
			const vendorItems = order.items.filter(
				(item) => item.product && productIds.includes(item.product._id)
			);

			const orderTotal = vendorItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			totalSpent += orderTotal;

			if (!firstOrder || order.createdAt < firstOrder) {
				firstOrder = order.createdAt;
			}
			if (!lastOrder || order.createdAt > lastOrder) {
				lastOrder = order.createdAt;
			}

			return {
				_id: order._id,
				orderNumber: order.orderNumber,
				createdAt: order.createdAt,
				status: order.status,
				items: vendorItems,
				totalAmount: orderTotal,
			};
		});

		const customerData = {
			_id: customer._id,
			name: customer.name,
			email: customer.email,
			orderCount: orders.length,
			totalSpent,
			firstOrder,
			lastOrder,
			orders: processedOrders.sort((a, b) => b.createdAt - a.createdAt),
		};

		return NextResponse.json({
			success: true,
			customer: customerData,
		});
	} catch (error) {
		console.error("Error fetching customer details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch customer details" },
			{ status: 500 }
		);
	}
}
