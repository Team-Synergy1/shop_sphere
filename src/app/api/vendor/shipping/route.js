import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import ShippingMethod from "@/models/Shipping";

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

		const shippingMethods = await ShippingMethod.find({
			vendor: session.user.id,
		}).sort({ createdAt: -1 });

		return NextResponse.json({
			success: true,
			shippingMethods,
		});
	} catch (error) {
		console.error("Error fetching shipping methods:", error);
		return NextResponse.json(
			{ error: "Failed to fetch shipping methods" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
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

		const shippingMethod = new ShippingMethod({
			...data,
			vendor: session.user.id,
		});

		await shippingMethod.save();

		return NextResponse.json(
			{
				success: true,
				shippingMethod,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating shipping method:", error);
		return NextResponse.json(
			{ error: "Failed to create shipping method" },
			{ status: 500 }
		);
	}
}
