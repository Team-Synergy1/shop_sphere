import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(req, { params }) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { street, city, state, postalCode, country, isDefault } = await req.json();

    // Validate required fields
    if (!street || !city || !state || !postalCode || !country) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the address to update
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    // Update address fields
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false
    };

    // If this address is being set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    return NextResponse.json({
      message: "Address updated successfully",
      address: user.addresses[addressIndex]
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find and remove the address
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If we removed the default address and there are other addresses,
    // make the first remaining address the default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}