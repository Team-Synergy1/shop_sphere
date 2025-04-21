import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all payment methods
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("paymentMethods");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ paymentMethods: user.paymentMethods || [] });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Add a new payment method
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();
    
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Retrieve the payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    // Check if this payment method is already added
    const existingMethod = user.paymentMethods.find(
      method => method.stripePaymentMethodId === paymentMethodId
    );

    if (existingMethod) {
      return NextResponse.json(
        { error: "Payment method already exists" },
        { status: 400 }
      );
    }

    // Format the payment method data
    const newPaymentMethod = {
      type: paymentMethod.type,
      cardLast4: paymentMethod.card.last4,
      cardBrand: paymentMethod.card.brand,
      cardExpiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
      stripePaymentMethodId: paymentMethod.id,
      isDefault: user.paymentMethods.length === 0 // Make it default if it's the first one
    };

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    return NextResponse.json({
      message: "Payment method added successfully",
      paymentMethod: newPaymentMethod
    });
  } catch (error) {
    console.error("Add payment method error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}