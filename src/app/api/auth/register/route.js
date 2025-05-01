import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
export async function POST(request) {
	try {
		const { name, email, password, role } = await request.json();

		if (!name || !email || !password) {
			return new Response(
				JSON.stringify({ message: "Missing required fields" }),
				{ status: 400 }
			);
		}

		await connectDB();

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return new Response(JSON.stringify({ message: "User already exists" }), {
				status: 409,
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			role: role || "user",
			status: 'active',
		});

		await newUser.save();

		return new Response(
			JSON.stringify({ message: "User registered successfully" }),
			{ status: 201 }
		);
	} catch (error) {
		console.error("Registration error:", error);
		return new Response(JSON.stringify({ message: "Internal server error" }), {
			status: 500,
		});
	}
}

export async function GET() {
	try {
		await connectDB();

		const users = await User.find({});
		return NextResponse.json(users);
	} catch (error) {
		console.error("Error retrieving users:", error.message);
		return NextResponse.json(
			{ message: "Error retrieving users", error: error.message },
			{ status: 500 }
		);
	}
}
