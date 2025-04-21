import { connectDB } from "@/lib/db";
import Deal from "@/models/Deal";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		await connectDB();

		const sampleDeals = [
			{
				code: "FLASH25",
				discount: "25% OFF",
				limit: "First 100 users",
				progress: 45,
				startTime: new Date(),
				endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
				isActive: true,
			},
			{
				code: "SUPER50",
				discount: "50% OFF",
				limit: "Limited time offer",
				progress: 75,
				startTime: new Date(),
				endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
				isActive: true,
			},
			{
				code: "NEWUSER",
				discount: "30% OFF",
				limit: "New users only",
				progress: 25,
				startTime: new Date(),
				endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
				isActive: true,
			},
		];

		// Clear existing deals
		await Deal.deleteMany({});

		// Insert new deals
		const deals = await Deal.insertMany(sampleDeals);

		return NextResponse.json(
			{
				message: "Sample deals created successfully",
				deals,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error seeding deals:", error);
		return NextResponse.json(
			{ error: "Failed to seed deals" },
			{ status: 500 }
		);
	}
}
