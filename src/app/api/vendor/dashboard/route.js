import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { authOptions } from "../../auth/[...nextauth]/route";
import Order from "@/models/Order"; // Update path as needed
import Product from "@/models/Product"; // Update path as needed

export async function GET(req) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user || session.user.role !== "vendor") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const vendorId = session.user.id;
		const today = new Date();
		const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const firstDayOfLastMonth = new Date(
			today.getFullYear(),
			today.getMonth() - 1,
			1
		);

		// Convert string ID to ObjectId if necessary
		const vendorObjectId = mongoose.Types.ObjectId.isValid(vendorId)
			? new mongoose.Types.ObjectId(vendorId)
			: vendorId;

		// Get all products for this vendor
		const vendorProducts = await Product.find({ v_id: vendorObjectId });
		const productIds = vendorProducts.map((p) => p._id);

		// Get all orders containing vendor products for current month
		const currentMonthOrders = await Order.find({
			createdAt: { $gte: firstDayOfMonth },
			status: { $ne: "cancelled" },
			"items.product": { $in: productIds },
		}).populate({
			path: "items.product",
			select: "_id",
		});

		// Get all orders containing vendor products for last month
		const lastMonthOrders = await Order.find({
			createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
			status: { $ne: "cancelled" },
			"items.product": { $in: productIds },
		}).populate({
			path: "items.product",
			select: "_id",
		});

		// Calculate the vendor's revenue from current month orders
		let currentMonthRevenue = 0;
		let currentMonthOrderCount = 0;

		currentMonthOrders.forEach((order) => {
			let hasVendorItems = false;

			// Filter items to those belonging to this vendor and calculate subtotal
			const vendorItemsTotal = order.items.reduce((sum, item) => {
				if (
					item.product &&
					productIds.some((id) => id.toString() === item.product._id.toString())
				) {
					hasVendorItems = true;
					return sum + (item.subtotal || item.price * item.quantity);
				}
				return sum;
			}, 0);

			if (hasVendorItems) {
				currentMonthRevenue += vendorItemsTotal;
				currentMonthOrderCount++;
			}
		});

		// Calculate the vendor's revenue from last month orders
		let lastMonthRevenue = 0;
		let lastMonthOrderCount = 0;

		lastMonthOrders.forEach((order) => {
			let hasVendorItems = false;

			// Filter items to those belonging to this vendor and calculate subtotal
			const vendorItemsTotal = order.items.reduce((sum, item) => {
				if (
					item.product &&
					productIds.some((id) => id.toString() === item.product._id.toString())
				) {
					hasVendorItems = true;
					return sum + (item.subtotal || item.price * item.quantity);
				}
				return sum;
			}, 0);

			if (hasVendorItems) {
				lastMonthRevenue += vendorItemsTotal;
				lastMonthOrderCount++;
			}
		});

		// Calculate percentage changes
		const revenueChange =
			lastMonthRevenue > 0
				? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
				: 100;

		const orderChange =
			lastMonthOrderCount > 0
				? ((currentMonthOrderCount - lastMonthOrderCount) /
						lastMonthOrderCount) *
				  100
				: 100;

		// Product counts
		const totalProducts = await Product.countDocuments({
			v_id: vendorObjectId,
		});
		const activeProducts = await Product.countDocuments({
			v_id: vendorObjectId,
			inStock: true,
		});

		// Get orders from last 30 days for product sales analysis
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentOrders = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: thirtyDaysAgo },
			status: { $ne: "cancelled" },
		})
			.populate({
				path: "items.product",
				select: "_id name images price",
			})
			.populate("user", "name email")
			.sort({ createdAt: -1 })
			.lean();

		// Calculate product sales
		const productSales = {};

		recentOrders.forEach((order) => {
			order.items.forEach((item) => {
				if (!item.product) return;

				const prodId =
					typeof item.product === "object"
						? item.product._id.toString()
						: item.product.toString();

				if (productIds.some((id) => id.toString() === prodId)) {
					if (!productSales[prodId]) {
						productSales[prodId] = {
							sold: 0,
							revenue: 0,
							product: null,
						};
					}

					const quantity = item.quantity || 1;
					const subtotal = item.subtotal || item.price * quantity;

					productSales[prodId].sold += quantity;
					productSales[prodId].revenue += subtotal;
					productSales[prodId].product = item.product;
				}
			});
		});

		// Format top products
		const topProducts = Object.entries(productSales)
			.map(([id, data]) => ({
				id,
				name: data.product?.name || "Unknown Product",
				sold: data.sold,
				revenue: data.revenue,
				inStock:
					vendorProducts.find((p) => p._id.toString() === id)?.stock || 0,
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// Format recent orders for display
		const formattedRecentOrders = recentOrders
			.filter((order) => {
				// Only include orders with vendor items
				return order.items.some(
					(item) =>
						item.product &&
						productIds.some(
							(id) =>
								id.toString() ===
								(typeof item.product === "object"
									? item.product._id.toString()
									: item.product.toString())
						)
				);
			})
			.map((order) => {
				// Calculate vendor's portion of the order
				const vendorTotal = order.items.reduce((sum, item) => {
					if (
						item.product &&
						productIds.some(
							(id) =>
								id.toString() ===
								(typeof item.product === "object"
									? item.product._id.toString()
									: item.product.toString())
						)
					) {
						return sum + (item.subtotal || item.price * (item.quantity || 1));
					}
					return sum;
				}, 0);

				return {
					id: order._id.toString(),
					orderNumber: order.orderNumber,
					customerName: order.user?.name || "Anonymous",
					amount: vendorTotal,
					status: order.status,
					date: order.createdAt,
				};
			})
			.slice(0, 5);

		// Low stock products
		const lowStockProducts = await Product.find({
			v_id: vendorObjectId,
			stock: { $lte: 10, $gt: 0 },
			inStock: true,
		}).lean();

		// Generate monthly sales data for chart (last 6 months)
		const months = [];
		for (let i = 5; i >= 0; i--) {
			const month = new Date();
			month.setMonth(month.getMonth() - i);
			months.push({
				date: new Date(month.getFullYear(), month.getMonth(), 1),
				name: month.toLocaleString("default", { month: "short" }),
			});
		}

		const salesByMonth = await Promise.all(
			months.map(async (month) => {
				const startOfMonth = month.date;
				const endOfMonth = new Date(startOfMonth);
				endOfMonth.setMonth(endOfMonth.getMonth() + 1);

				// Get orders for this month
				const monthOrders = await Order.find({
					createdAt: { $gte: startOfMonth, $lt: endOfMonth },
					"items.product": { $in: productIds },
					status: { $ne: "cancelled" },
				}).populate({
					path: "items.product",
					select: "_id",
				});

				// Calculate vendor's revenue for this month
				let monthRevenue = 0;

				monthOrders.forEach((order) => {
					const vendorItemsTotal = order.items.reduce((sum, item) => {
						if (
							item.product &&
							productIds.some(
								(id) => id.toString() === item.product._id.toString()
							)
						) {
							return sum + (item.subtotal || item.price * item.quantity);
						}
						return sum;
					}, 0);

					monthRevenue += vendorItemsTotal;
				});

				return {
					month: month.name,
					sales: monthRevenue,
				};
			})
		);

		// Calculate fulfillment rate
		// Get all vendor orders from last month
		const allOrdersLastMonth = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: firstDayOfLastMonth },
		});

		// Count orders with vendor products
		let vendorOrderCount = 0;
		let deliveredOrderCount = 0;

		allOrdersLastMonth.forEach((order) => {
			// Check if order has vendor products
			const hasVendorProducts = order.items.some(
				(item) =>
					item.product &&
					productIds.some(
						(id) =>
							id.toString() ===
							(typeof item.product === "object"
								? item.product._id.toString()
								: item.product.toString())
					)
			);

			if (hasVendorProducts) {
				vendorOrderCount++;
				if (order.status === "delivered") {
					deliveredOrderCount++;
				}
			}
		});

		const fulfillmentRate =
			vendorOrderCount > 0
				? Math.round((deliveredOrderCount / vendorOrderCount) * 100)
				: 100;

		return NextResponse.json({
			stats: {
				totalRevenue: currentMonthRevenue,
				totalOrders: currentMonthOrderCount,
				revenueChange: revenueChange.toFixed(1),
				orderChange: orderChange.toFixed(1),
				totalProducts,
				activeProducts,
			},
			recentOrders: formattedRecentOrders,
			lowStockProducts: lowStockProducts.map((p) => ({
				id: p._id.toString(),
				name: p.name,
				stock: p.stock,
			})),
			monthlySales: salesByMonth,
			topProducts,
			orderFulfillment: {
				rate: fulfillmentRate,
				delivered: deliveredOrderCount,
				total: vendorOrderCount,
			},
		});
	} catch (error) {
		console.error("Dashboard Error:", error.message);
		console.error("Error Stack:", error.stack);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
