import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
export async function GET() {
	try {
	  // Check authentication
	  const session = await getServerSession(authOptions);
	  if (!session?.user) {
		return NextResponse.json({ error: "Authentication required" }, { status: 401 });
	  }
  
	  // Connect to database
	  await connectDB();
  
	  // Get user with addresses
	  const user = await User.findById(session.user.id).select('addresses');
	  
	  if (!user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	  }
  
	  return NextResponse.json({
		success: true,
		addresses: user.addresses || []
	  });
	} catch (error) {
	  console.error("Get addresses error:", error);
	  return NextResponse.json(
		{ error: `Error retrieving addresses: ${error.message}` },
		{ status: 500 }
	  );
	}
  }