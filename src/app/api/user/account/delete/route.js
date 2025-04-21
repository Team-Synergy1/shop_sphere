import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function DELETE(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Delete user's orders
		await Order.deleteMany({ userId: session.user.id });

		// Delete the user
		await User.findByIdAndDelete(session.user.id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting account:", error);
		return NextResponse.json(
			{ error: "Failed to delete account" },
			{ status: 500 }
		);
	}
}
