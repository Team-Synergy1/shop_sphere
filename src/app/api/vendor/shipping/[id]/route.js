import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import ShippingMethod from "@/models/Shipping";
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
				{ error: "Invalid shipping method ID" },
				{ status: 400 }
			);
		}

		const shippingMethod = await ShippingMethod.findOne({
			_id: id,
			vendor: session.user.id,
		});

		if (!shippingMethod) {
			return NextResponse.json(
				{ error: "Shipping method not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			shippingMethod,
		});
	} catch (error) {
		console.error("Error fetching shipping method:", error);
		return NextResponse.json(
			{ error: "Failed to fetch shipping method" },
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
		const data = await request.json();

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: "Invalid shipping method ID" },
				{ status: 400 }
			);
		}

		const shippingMethod = await ShippingMethod.findOneAndUpdate(
			{
				_id: id,
				vendor: session.user.id,
			},
			{ $set: data },
			{ new: true }
		);

		if (!shippingMethod) {
			return NextResponse.json(
				{ error: "Shipping method not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			shippingMethod,
		});
	} catch (error) {
		console.error("Error updating shipping method:", error);
		return NextResponse.json(
			{ error: "Failed to update shipping method" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request, { params }) {
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
				{ error: "Invalid shipping method ID" },
				{ status: 400 }
			);
		}

		const shippingMethod = await ShippingMethod.findOneAndDelete({
			_id: id,
			vendor: session.user.id,
		});

		if (!shippingMethod) {
			return NextResponse.json(
				{ error: "Shipping method not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Shipping method deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting shipping method:", error);
		return NextResponse.json(
			{ error: "Failed to delete shipping method" },
			{ status: 500 }
		);
	}
}
