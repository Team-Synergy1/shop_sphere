import { connectDB } from "@/lib/db";
import Deal from "@/models/Deal";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await connectDB();

		// Get only active deals that haven't expired
		const deals = await Deal.find({
			isActive: true,
			endTime: { $gt: new Date() },
		});

		return NextResponse.json(deals);
	} catch (error) {
		console.error("Error fetching deals:", error);
		return NextResponse.json(
			{ error: "Failed to fetch deals" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const data = await request.json();

		// Set default times if not provided
		if (!data.startTime) {
			data.startTime = new Date();
		}
		if (!data.endTime) {
			// Default end time is 24 hours from start
			data.endTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
		}

		const deal = await Deal.create(data);
		return NextResponse.json(deal, { status: 201 });
	} catch (error) {
		console.error("Error creating deal:", error);
		return NextResponse.json(
			{ error: "Failed to create deal" },
			{ status: 500 }
		);
	}
}
