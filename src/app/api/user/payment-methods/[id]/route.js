import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Delete a payment method
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const paymentMethod = user.paymentMethods.find(
      method => method.stripePaymentMethodId === id
    );

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Delete from Stripe
    await stripe.paymentMethods.detach(id);

    // Remove from user document
    user.paymentMethods = user.paymentMethods.filter(
      method => method.stripePaymentMethodId !== id
    );

    // If we removed the default method and there are other methods, make another one default
    if (paymentMethod.isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ 
      message: "Payment method removed successfully",
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Set payment method as default
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the payment method
    const paymentMethodIndex = user.paymentMethods.findIndex(
      method => method.stripePaymentMethodId === id
    );

    if (paymentMethodIndex === -1) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Update default status
    user.paymentMethods.forEach((method, index) => {
      method.isDefault = index === paymentMethodIndex;
    });

    await user.save();

    return NextResponse.json({
      message: "Default payment method updated successfully",
      paymentMethods: user.paymentMethods
    });
  } catch (error) {
    console.error("Update default payment method error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}