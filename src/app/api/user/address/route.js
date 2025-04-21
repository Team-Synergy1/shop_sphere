import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
	await connectDB();

	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { street, city, state, postalCode, country, isDefault } =
			await req.json();

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
			isDefault: isDefault || user.addresses.length === 0, // Make first address default
		};

		// If this is the first address or marked as default, update other addresses
		if (newAddress.isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

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

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const user = await User.findById(session.user.id).select("addresses");

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ addresses: user.addresses || [] });
	} catch (error) {
		console.error("Error fetching addresses:", error);
		return NextResponse.json(
			{ error: "Failed to fetch addresses" },
			{ status: 500 }
		);
	}
}
