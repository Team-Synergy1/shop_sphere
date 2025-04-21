import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
	// Connect to the database
	await connectDB();

	// Get the current logged in user
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { street, city, state, postalCode, country } = await req.json();

		// Validate required fields
		if (!street || !city || !state || !postalCode || !country) {
			return NextResponse.json(
				{ message: "All fields are required" },
				{ status: 400 }
			);
		}

		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		
		const newAddress = {
			street,
			city,
			state,
			postalCode,
			country,
			isDefault: user.addresses.length === 0, 
		};

		user.addresses.push(newAddress);
		await user.save();

		return NextResponse.json(
			{
				message: "Address added successfully",
				address: newAddress,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error adding address:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
