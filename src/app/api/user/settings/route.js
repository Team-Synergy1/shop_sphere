import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const user = await User.findById(session.user.id).select("settings");

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Return default settings if none exist
		const settings = user.settings || {
			notifications: {
				orderUpdates: true,
				promotions: true,
				newsletter: false,
			},
			privacy: {
				shareOrderHistory: false,
				shareWishlist: true,
			},
			preferences: {
				language: "en",
				currency: "USD",
			},
		};

		return NextResponse.json({ settings });
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch settings" },
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
		const { category, setting, value } = body;

		if (!category || !setting || value === undefined) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		await connectDB();
		const updatePath = `settings.${category}.${setting}`;
		const updateQuery = { $set: { [updatePath]: value } };

		const user = await User.findByIdAndUpdate(session.user.id, updateQuery, {
			new: true,
		}).select("settings");

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ settings: user.settings });
	} catch (error) {
		console.error("Error updating settings:", error);
		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 }
		);
	}
}
