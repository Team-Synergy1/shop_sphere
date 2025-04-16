// src/app/api/user/wishlist/check/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import {connectDB} from "@/lib/db";
import User from "@/models/User";

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
    
    // Check if product is in wishlist
    const isInWishlist = user.wishlist && user.wishlist.some(id => 
      id.toString() === productId.toString()
    );
    
    return NextResponse.json({ isInWishlist });
  } catch (error) {
    console.error("Check wishlist error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}