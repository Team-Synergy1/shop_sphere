import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
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

		await connectDB();

		const orderId = params.id;

		try {
			const order = await Order.findOne({
				_id: new mongoose.Types.ObjectId(orderId),
				user: session.user.id,
			}).populate("items.product", "name images price");

			if (!order) {
				return NextResponse.json({ error: "Order not found" }, { status: 404 });
			}

			return NextResponse.json({
				success: true,
				order,
			});
		} catch (err) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ error: "Failed to fetch order details" },
			{ status: 500 }
		);
	}
}
