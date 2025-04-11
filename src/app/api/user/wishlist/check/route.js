import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ inWishlist: false }, { status: 200 });
    }

    const userId = session.user.id;
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({
      user_id: userId,
      products: productId
    });

    return NextResponse.json({
      inWishlist: !!wishlist
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}