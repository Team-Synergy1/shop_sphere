import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
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

		// Get orders containing vendor's products
		const orders = await Order.find({
			"items.product": { $in: productIds },
		})

			.populate({
				path: "items.product",
				select: "name images price vendor",
			})
			.populate({
				path: "user",
				select: "name email",
			})
			.sort({ createdAt: -1 });

		// Format orders to include only vendor's items
		const formattedOrders = orders.map((order) => {
			const vendorItems = order.items.filter((item) => {
				return item.product && productIds.includes(item.product._id);
			});

			const totalAmount = vendorItems.reduce((sum, item) => {
				return sum + item.price * item.quantity;
			}, 0);

			return {
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
		});

		return NextResponse.json({
			success: true,
			orders: formattedOrders,
		});
	} catch (error) {
		console.error("Error fetching vendor orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
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

		const data = await request.json();
		const { orderId, status } = data;

		if (!orderId || !status) {
			return NextResponse.json(
				{ error: "Order ID and status are required" },
				{ status: 400 }
			);
		}

		// Verify vendor owns products in the order
		const order = await Order.findById(orderId).populate("items.product");
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		const vendorProducts = await Product.find({ v_id: session.user.id });
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
