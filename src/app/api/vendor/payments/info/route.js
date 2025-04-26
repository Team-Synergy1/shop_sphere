import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { VendorPayment } from "@/models/VendorPayment";

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

		const paymentInfo = await VendorPayment.findOne({
			vendor: session.user.id,
		});

		return NextResponse.json({
			success: true,
			paymentInfo: paymentInfo || {},
		});
	} catch (error) {
		console.error("Error fetching payment info:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payment information" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request) {
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

		const paymentInfo = await VendorPayment.findOneAndUpdate(
			{ vendor: session.user.id },
			{ $set: data },
			{ new: true, upsert: true }
		);

		return NextResponse.json({
			success: true,
			paymentInfo,
		});
	} catch (error) {
		console.error("Error updating payment info:", error);
		return NextResponse.json(
			{ error: "Failed to update payment information" },
			{ status: 500 }
		);
	}
}
