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
        const { productId, quantity } = await req.json();
        
        // Get the user and their cart
        const user = await User.findById(userId);
        
        if (!user || !user.cart || !Array.isArray(user.cart)) {
            return NextResponse.json(
                { message: "Cart not found." },
                { status: 404 }
            );
        }
        
        // Find the product in the cart
        const productIndex = user.cart.findIndex(
            item => item._id === productId
        );
        
        if (productIndex === -1) {
            return NextResponse.json(
                { message: "Product not found in cart." },
                { status: 404 }
            );
        }
        
        // Update the quantity
        user.cart[productIndex].quantity = quantity;
        
        // Save the updated cart
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { cart: user.cart } },
            { new: true }
        );
        
        return NextResponse.json(
            {
                message: "Cart updated successfully",
                cart: updatedUser.cart,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating cart:", error.name, error.message);
        return NextResponse.json(
            {
                message: "Error updating cart",
                error: error.message,
            },
            { status: 500 }
        );
    }
}