import { connectDB } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
export async function POST(req) {
    try {
      await connectDB();
      
      const session = await getServerSession(authOptions);
      console.log(session);
      
      if (!session || !session.user) {
        return NextResponse.json(
          { message: "Unauthorized. Please log in." },
          { status: 401 }
        );
      }
      
      const userId = session.user.id;
      const product = await req.json();
      console.log("Received product:", product);
      
      const user = await User.findById(userId);
      
      // Initialize cart if it doesn't exist
      if (!user.cart || !Array.isArray(user.cart)) {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: { cart: [{ ...product, quantity: 1 }] } },
          { new: true }
        );
        
        return NextResponse.json(
          {
            message: "Product added to cart successfully",
            cart: updatedUser.cart,
            updated: false,
            quantity: 1
          },
          { status: 200 }
        );
      } else {
        // Check if product already exists in cart
        const existingProductIndex = user.cart.findIndex(
          item => item._id.toString() === product._id.toString()
        );
        
        if (existingProductIndex !== -1) {
          // Product exists - update quantity
          const currentQuantity = user.cart[existingProductIndex].quantity || 1;
          const newQuantity = currentQuantity + 1;
          
          // Create a query to update just the quantity of the specific cart item
          user.cart[existingProductIndex].quantity = newQuantity;
          
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { cart: user.cart } },
            { new: true }
          );
          
          return NextResponse.json(
            {
              message: "Product quantity updated in cart",
              cart: updatedUser.cart,
              updated: true,
              quantity: newQuantity
            },
            { status: 200 }
          );
        } else {
          // Product doesn't exist in cart - add it
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { cart: { ...product, quantity: 1 } } },
            { new: true }
          );
          
          return NextResponse.json(
            {
              message: "Product added to cart successfully",
              cart: updatedUser.cart,
              updated: false,
              quantity: 1
            },
            { status: 200 }
          );
        }
      }
    } catch (error) {
      console.error("Error saving product:", error.name, error.message);
      console.error(error.stack);
      return NextResponse.json(
        {
          message: "Error saving product",
          error: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }
  }


export async function GET() {
    try {
      await connectDB();
      
    
      const session = await getServerSession(authOptions);
      console.log("session:", session);
      
      if (!session || !session?.user) {
        return NextResponse.json(
          { message: "Unauthorized. Please log in." },
          { status: 401 }
        );
      }
      
      const userId = session?.user?.id;
      const user = await User.findById(userId).select("cart");
      
      if (!user) {
        return NextResponse.json(
          { message: "user not found." },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        {
          message: "cart fetched successfully",
          cart: user.cart || [],
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("error fetching cart:", error.name, error.message);
      return NextResponse.json(
        {
          message: "error fetching cart",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }
