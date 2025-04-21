import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const status = searchParams.get("status");

		const query = { user: session.user.id };
		if (status) query.status = status;

		const skip = (page - 1) * limit;
		const total = await Order.countDocuments(query);
		const pages = Math.ceil(total / limit);

		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("items.product", "name images price");

		return NextResponse.json({
			orders,
			pagination: {
				total,
				pages,
				page,
			},
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}

// For getting a specific order details
export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { orderId } = body;

		await connectDB();

		const order = await Order.findOne({
			_id: orderId,
			user: session.user.id,
		}).populate("items.product", "name images price");

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		return NextResponse.json({ order });
	} catch (error) {
		console.error("Error fetching order details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch order details" },
			{ status: 500 }
		);
	}
}
