import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/VendorPayment";

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

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page")) || 1;
		const limit = parseInt(searchParams.get("limit")) || 10;
		const type = searchParams.get("type");
		const status = searchParams.get("status");

		// Build query
		const query = { vendor: session.user.id };
		if (type) query.type = type;
		if (status) query.status = status;

		const skip = (page - 1) * limit;

		const transactions = await Transaction.find(query)
			.sort({ date: -1 })
			.skip(skip)
			.limit(limit)
			.populate("order", "orderNumber");

		const total = await Transaction.countDocuments(query);

		return NextResponse.json({
			success: true,
			transactions,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching transactions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transactions" },
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

		const transaction = new Transaction({
			...data,
			vendor: session.user.id,
		});

		await transaction.save();

		return NextResponse.json(
			{
				success: true,
				transaction,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating transaction:", error);
		return NextResponse.json(
			{ error: "Failed to create transaction" },
			{ status: 500 }
		);
	}
}
