import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {connectDB }from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const user = await User.findById(session.user.id).select("-password -__v");

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ user });
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
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
		const { name, phone, avatar, preferences } = body;

		await connectDB();
		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Update fields if provided
		if (name) user.name = name;
		if (phone) user.phone = phone;
		if (avatar) user.avatar = avatar;
		if (preferences) {
			user.preferences = {
				...user.preferences,
				...preferences,
			};
		}

		await user.save();

		// Return updated user without sensitive information
		const updatedUser = user.toObject();
		delete updatedUser.password;
		delete updatedUser.__v;

		return NextResponse.json({ user: updatedUser });
	} catch (error) {
		console.error("Error updating profile:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 }
		);
	}
}
