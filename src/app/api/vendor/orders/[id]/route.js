import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
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
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		// Get vendor's products
		const vendorProducts = await Product.find({ vendor: session.user.id });
		const productIds = vendorProducts.map((product) => product._id);

		// Get the order and check if it contains vendor's products
		const order = await Order.findById(id)
			.populate({
				path: "items.product",
				select: "name images price vendor",
			})
			.populate({
				path: "user",
				select: "name email",
			});

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Filter order items to only include vendor's products
		const vendorItems = order.items.filter(
			(item) => item.product && productIds.includes(item.product._id)
		);

		if (vendorItems.length === 0) {
			return NextResponse.json(
				{ error: "No products from this vendor in the order" },
				{ status: 403 }
			);
		}

		const totalAmount = vendorItems.reduce((sum, item) => {
			return sum + item.price * item.quantity;
		}, 0);

		const formattedOrder = {
			_id: order._id,
			orderNumber: order.orderNumber,
			createdAt: order.createdAt,
			status: order.status,
			paymentStatus: order.paymentStatus,
			paymentMethod: order.paymentMethod,
			items: vendorItems,
			totalAmount,
			customerName: order.user?.name || "Anonymous",
			customerEmail: order.user?.email,
			shippingAddress: order.shippingAddress,
		};

		return NextResponse.json({
			success: true,
			order: formattedOrder,
		});
	} catch (error) {
		console.error("Error fetching order details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch order details" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request, { params }) {
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
		const { status } = await request.json();

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		// Verify vendor owns products in the order
		const order = await Order.findById(id).populate("items.product");
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		const vendorProducts = await Product.find({ vendor: session.user.id });
		const productIds = vendorProducts.map((product) => product._id.toString());

		const hasVendorProducts = order.items.some((item) =>
			productIds.includes(item.product._id.toString())
		);

		if (!hasVendorProducts) {
			return NextResponse.json(
				{ error: "Access denied. No products from this vendor in the order." },
				{ status: 403 }
			);
		}

		order.status = status;
		await order.save();

		return NextResponse.json({
			success: true,
			message: "Order status updated successfully",
			order,
		});
	} catch (error) {
		console.error("Error updating order status:", error);
		return NextResponse.json(
			{ error: "Failed to update order status" },
			{ status: 500 }
		);
	}
}
