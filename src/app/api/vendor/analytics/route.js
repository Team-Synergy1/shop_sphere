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

		// Get orders containing vendor's products within the date range with full population
		const orders = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: startDate },
		})
			.populate({
				path: "items.product",
				select: "_id name images price v_id",
			})
			.populate("user");

		// Calculate previous period for comparison with proper population
		const previousStartDate = new Date(startDate.getTime() - (now - startDate));
		const previousOrders = await Order.find({
			"items.product": { $in: productIds },
			createdAt: { $gte: previousStartDate, $lt: startDate },
		}).populate({
			path: "items.product",
			select: "_id v_id",
		});

		// Process orders to get vendor-specific data
		let currentPeriodRevenue = 0;
		let previousPeriodRevenue = 0;
		const customerSet = new Set();
		const newCustomerSet = new Set();
		const productSales = {};
		const dailyRevenue = {};
		const dailyOrders = {};

		// Initialize product sales tracking with all vendor products
		vendorProducts.forEach((product) => {
			productSales[product._id.toString()] = {
				_id: product._id,
				name: product.name,
				image:
					product.images && product.images.length > 0 ? product.images[0] : "",
				unitsSold: 0,
				revenue: 0,
			};
		});

		console.log(
			`Processing ${orders.length} orders for vendor ${session.user.id}`
		);

		// Process current period orders
		orders.forEach((order) => {
			// Filter to items where the product belongs to this vendor
			const vendorItems = order.items.filter((item) => {
				return (
					item.product &&
					item.product.v_id &&
					item.product.v_id.toString() === session.user.id
				);
			});

			if (vendorItems.length === 0) {
				return; // Skip orders with no vendor items
			}

			// Calculate revenue from this vendor's items in the order
			const orderRevenue = vendorItems.reduce((sum, item) => {
				// Use subtotal if available, otherwise calculate from price and quantity
				const itemTotal = item.subtotal || item.price * (item.quantity || 1);
				return sum + itemTotal;
			}, 0);

			currentPeriodRevenue += orderRevenue;

			// Track customers
			if (order.user) {
				customerSet.add(order.user._id.toString());

				// Check if this is the customer's first order from this vendor
				const previousOrdersFromCustomer = orders.filter(
					(o) =>
						o.user &&
						o.user._id.toString() === order.user._id.toString() &&
						o.createdAt < order.createdAt
				);

				if (previousOrdersFromCustomer.length === 0) {
					newCustomerSet.add(order.user._id.toString());
				}
			}

			// Track product sales
			vendorItems.forEach((item) => {
				if (!item.product) return;

				const productId = item.product._id.toString();
				const quantity = item.quantity || 1;
				const itemRevenue = item.subtotal || item.price * quantity;

				if (productSales[productId]) {
					productSales[productId].unitsSold += quantity;
					productSales[productId].revenue += itemRevenue;
				}
			});

			// Track daily stats
			const date = order.createdAt.toISOString().split("T")[0];
			dailyRevenue[date] = (dailyRevenue[date] || 0) + orderRevenue;
			dailyOrders[date] = (dailyOrders[date] || 0) + 1;
		});

		// Process previous period orders
		previousOrders.forEach((order) => {
			// Filter to items where the product belongs to this vendor
			const vendorItems = order.items.filter((item) => {
				return (
					item.product &&
					item.product.v_id &&
					item.product.v_id.toString() === session.user.id
				);
			});

			if (vendorItems.length === 0) {
				return; // Skip orders with no vendor items
			}

			// Calculate revenue from this vendor's items
			const orderRevenue = vendorItems.reduce((sum, item) => {
				return sum + (item.subtotal || item.price * (item.quantity || 1));
			}, 0);

			previousPeriodRevenue += orderRevenue;
		});

		// Calculate revenue change percentage
		const revenueChange =
			previousPeriodRevenue === 0
				? 100
				: ((currentPeriodRevenue - previousPeriodRevenue) /
						previousPeriodRevenue) *
				  100;

		// Format chart data
		const revenueData = Object.entries(dailyRevenue).map(([date, amount]) => ({
			date,
			amount,
		}));

		const ordersData = Object.entries(dailyOrders).map(([date, count]) => ({
			date,
			count,
		}));

		// Get top selling products - sort by revenue
		const topSellingProducts = Object.values(productSales)
			.filter((product) => product.unitsSold > 0) // Only include products with sales
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// If we don't have 5 products with sales, fill with other products
		if (topSellingProducts.length < 5) {
			const additionalProducts = Object.values(productSales)
				.filter((product) => product.unitsSold === 0) // Get products with no sales
				.slice(0, 5 - topSellingProducts.length);

			topSellingProducts.push(...additionalProducts);
		}

		const analytics = {
			revenue: {
				total: currentPeriodRevenue,
				change: parseFloat(revenueChange.toFixed(2)),
				data: revenueData,
			},
			orders: {
				total: orders.filter((order) =>
					order.items.some(
						(item) =>
							item.product &&
							item.product.v_id &&
							item.product.v_id.toString() === session.user.id
					)
				).length,
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
