// app/api/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

   
    await connectDB();

   
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (orderId) {
   
      try {
        const order = await Order.findOne({
          _id: new mongoose.Types.ObjectId(orderId),
          user: session.user.id
        }).populate('items.product', 'name images');
        
        if (!order) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          order
        });
      } catch (err) {
        return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
      }
    } else {
     
      const orders = await Order.find({ 
        user: session.user.id 
      })
      .sort({ createdAt: -1 }) 
      .populate('items.product', 'name images');
      
      return NextResponse.json({
        success: true,
        orders
      });
    }
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: `Error retrieving orders: ${error.message}` },
      { status: 500 }
    );
  }
}