import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

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

		// Get time range from query params
		const { searchParams } = new URL(request.url);
		const timeRange = searchParams.get("timeRange") || "7d";

		// Calculate date range
		const now = new Date();
		let startDate;
		switch (timeRange) {
			case "7d":
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "30d":
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case "90d":
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case "1y":
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			default:
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		}

		// Get vendor's products
		const vendorProducts = await Product.find({ v_id: session.user.id });
		const productIds = vendorProducts.map((product) => product._id);

		// Get orders containing vendor's products within the date range
		const orders = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: startDate },
		}).populate("items.product user");

		// Calculate previous period for comparison
		const previousStartDate = new Date(startDate.getTime() - (now - startDate));
		const previousOrders = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: previousStartDate, $lt: startDate },
		});

		// Process orders to get vendor-specific data
		let currentPeriodRevenue = 0;
		let previousPeriodRevenue = 0;
		const customerSet = new Set();
		const newCustomerSet = new Set();
		const productSales = {};

		// Initialize product sales tracking
		vendorProducts.forEach((product) => {
			productSales[product._id.toString()] = {
				_id: product._id,
				name: product.name,
				image: product.images[0],
				unitsSold: 0,
				revenue: 0,
			};
		});

		// Process current period orders
		orders.forEach((order) => {
			const vendorItems = order.items.filter(
				(item) => item.product && productIds.includes(item.product._id)
			);

			const orderRevenue = vendorItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			currentPeriodRevenue += orderRevenue;

			if (order.user) {
				customerSet.add(order.user._id.toString());

				// Check if this is the customer's first order from this vendor
				const previousOrders = orders.filter(
					(o) =>
						o.user &&
						o.user._id.toString() === order.user._id.toString() &&
						o.createdAt < order.createdAt
				);

				if (previousOrders.length === 0) {
					newCustomerSet.add(order.user._id.toString());
				}
			}

			// Track product sales
			vendorItems.forEach((item) => {
				if (item.product) {
					const productId = item.product._id.toString();
					productSales[productId].unitsSold += item.quantity;
					productSales[productId].revenue += item.price * item.quantity;
				}
			});
		});

		// Process previous period orders for revenue comparison
		previousOrders.forEach((order) => {
			const vendorItems = order.items.filter(
				(item) => item.product && productIds.includes(item.product._id)
			);

			const orderRevenue = vendorItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			previousPeriodRevenue += orderRevenue;
		});

		// Calculate revenue change percentage
		const revenueChange =
			previousPeriodRevenue === 0
				? 100
				: ((currentPeriodRevenue - previousPeriodRevenue) /
						previousPeriodRevenue) *
				  100;

		// Get daily revenue data for charts
		const dailyRevenue = {};
		const dailyOrders = {};

		orders.forEach((order) => {
			const date = order.createdAt.toISOString().split("T")[0];
			const vendorItems = order.items.filter(
				(item) => item.product && productIds.includes(item.product._id)
			);

			const orderRevenue = vendorItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			dailyRevenue[date] = (dailyRevenue[date] || 0) + orderRevenue;
			dailyOrders[date] = (dailyOrders[date] || 0) + 1;
		});

		// Format chart data
		const revenueData = Object.entries(dailyRevenue).map(([date, amount]) => ({
			date,
			amount,
		}));

		const ordersData = Object.entries(dailyOrders).map(([date, count]) => ({
			date,
			count,
		}));

		// Get top selling products
		const topSellingProducts = Object.values(productSales)
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		const analytics = {
			revenue: {
				total: currentPeriodRevenue,
				change: parseFloat(revenueChange.toFixed(2)),
				data: revenueData,
			},
			orders: {
				total: orders.length,
				change:
					previousOrders.length === 0
						? 100
						: parseFloat(
								(
									((orders.length - previousOrders.length) /
										previousOrders.length) *
									100
								).toFixed(2)
						  ),
				data: ordersData,
			},
			products: {
				total: vendorProducts.length,
				topSelling: topSellingProducts,
			},
			customers: {
				total: customerSet.size,
				new: newCustomerSet.size,
				returning: customerSet.size - newCustomerSet.size,
			},
		};

		return NextResponse.json({
			success: true,
			analytics,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch analytics" },
			{ status: 500 }
		);
	}
}
