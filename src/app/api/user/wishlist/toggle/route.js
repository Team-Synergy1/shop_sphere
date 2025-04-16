import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import User from "@/models/User"; // Assuming you have a User model
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Initialize wishlist array if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }
    
    const inWishlist = user.wishlist.includes(productId);
    
    if (inWishlist) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }
    
    await user.save();
    
    return NextResponse.json({ 
      inWishlist: !inWishlist,
      message: inWishlist ? "Removed from wishlist" : "Added to wishlist"
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}