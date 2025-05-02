import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		// Check if user is authenticated and is a vendor
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

		// Only fetch products belonging to the current vendor
		const products = await Product.find({ v_id: session.user.id });

		return NextResponse.json(products);
	} catch (error) {
		console.error("Error fetching vendor products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
