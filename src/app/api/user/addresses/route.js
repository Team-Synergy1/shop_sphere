import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {connectDB} from "@/lib/db";
import User from "@/models/User";

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

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			fullName,
			addressLine1,
			addressLine2,
			city,
			state,
			postalCode,
			country,
			phone,
			isDefault,
		} = body;

		// Validate required fields
		if (
			!fullName ||
			!addressLine1 ||
			!city ||
			!state ||
			!postalCode ||
			!country ||
			!phone
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		await connectDB();
		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const newAddress = {
			fullName,
			addressLine1,
			addressLine2,
			city,
			state,
			postalCode,
			country,
			phone,
			isDefault: isDefault || false,
		};

		// If this is the first address or marked as default, update other addresses
		if (isDefault || user.addresses.length === 0) {
			user.addresses.forEach((addr) => (addr.isDefault = false));
			newAddress.isDefault = true;
		}

		user.addresses.push(newAddress);
		await user.save();

		return NextResponse.json({ addresses: user.addresses });
	} catch (error) {
		console.error("Error adding address:", error);
		return NextResponse.json(
			{ error: "Failed to add address" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { addressId, ...updates } = body;

		if (!addressId) {
			return NextResponse.json(
				{ error: "Address ID is required" },
				{ status: 400 }
			);
		}

		await connectDB();
		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);

		if (addressIndex === -1) {
			return NextResponse.json({ error: "Address not found" }, { status: 404 });
		}

		// If setting as default, update other addresses
		if (updates.isDefault) {
			user.addresses.forEach((addr) => (addr.isDefault = false));
		}

		// Update the address
		Object.assign(user.addresses[addressIndex], updates);
		await user.save();

		return NextResponse.json({ addresses: user.addresses });
	} catch (error) {
		console.error("Error updating address:", error);
		return NextResponse.json(
			{ error: "Failed to update address" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const addressId = searchParams.get("id");

		if (!addressId) {
			return NextResponse.json(
				{ error: "Address ID is required" },
				{ status: 400 }
			);
		}

		await connectDB();
		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);

		if (addressIndex === -1) {
			return NextResponse.json({ error: "Address not found" }, { status: 404 });
		}

		// If deleting default address, set the first remaining address as default
		const wasDefault = user.addresses[addressIndex].isDefault;
		user.addresses.splice(addressIndex, 1);

		if (wasDefault && user.addresses.length > 0) {
			user.addresses[0].isDefault = true;
		}

		await user.save();

		return NextResponse.json({ addresses: user.addresses });
	} catch (error) {
		console.error("Error deleting address:", error);
		return NextResponse.json(
			{ error: "Failed to delete address" },
			{ status: 500 }
		);
	}
}
