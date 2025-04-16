import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    
    // Find the user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get the user's wishlist
    const wishlistIds = user.wishlist || [];
    
    // Fetch the product details for each item in the wishlist
    const wishlistItems = await Product.find({
      _id: { $in: wishlistIds }
    });
    
    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}