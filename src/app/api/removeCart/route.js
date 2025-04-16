import { connectDB } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Remove item from cart
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { _id: productId } } },
      { new: true }
    );
    
    return NextResponse.json(
      { 
        message: "Product removed from cart successfully", 
        cart: updatedUser.cart 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing product:", error.name, error.message);
    console.error(error.stack);
    return NextResponse.json(
      {
        message: "Error removing product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}