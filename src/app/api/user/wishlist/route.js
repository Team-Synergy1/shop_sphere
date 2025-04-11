// app/api/user/wishlist/route.js
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { connectDB } from "@/lib/db";
// import Wishlist from "@/models/Wishlist";
// import Product from "@/models/Product";


// // GET - Fetch wishlist items
// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectDB();
//     const userId = session.user.id;

//     // Find or create wishlist for the user
//     let wishlist = await Wishlist.findOne({ user: userId });

//     if (!wishlist) {
//       wishlist = new Wishlist({
//         user: userId,
//         products: []
//       });
//       await wishlist.save();
//       return NextResponse.json([]);
//     }

//     // Fetch product details for all wishlist items
//     const products = await Product.find({
//       _id: { $in: wishlist.products }
//     }).select('name description price images stock');

//     return NextResponse.json(products);

//   } catch (error) {
//     console.error("Wishlist fetch error:", error);
//     return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
//   }
// }

// // POST - Add item to wishlist
// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { productId } = await req.json();

//     if (!productId) {
//       return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
//     }

//     await connectDB();
//     const userId = session.user.id;

//     // Check if product exists
//     const product = await Product.findById(productId);
//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Find or create wishlist for the user
//     let wishlist = await Wishlist.findOne({ user: userId });

//     if (!wishlist) {
//       wishlist = new Wishlist({
//         user: userId,
//         products: [productId]
//       });
//     } else if (!wishlist.products.includes(productId)) {
//       wishlist.products.push(productId);
//     }

//     await wishlist.save();

//     return NextResponse.json({ message: "Product added to wishlist" });

//   } catch (error) {
//     console.error("Add to wishlist error:", error);
//     return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";


// Get user's wishlist
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find the user's wishlist and populate product details
    let wishlist = await Wishlist.findOne({ user_id: userId }).populate('products');

    // If no wishlist exists, create an empty one
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id: userId,
        products: []
      });
    }

    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add/remove product from wishlist
export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Find the user's wishlist
    let wishlist = await Wishlist.findOne({ user_id: userId });

    // If no wishlist exists, create one
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user_id: userId,
        products: [productId]
      });
      return NextResponse.json({
        wishlist,
        message: "Product added to wishlist",
        added: true
      }, { status: 200 });
    }

    // Check if product is already in wishlist
    const productIndex = wishlist.products.indexOf(productId);

    if (productIndex > -1) {
      // Remove product if already in wishlist
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();
      return NextResponse.json({
        wishlist,
        message: "Product removed from wishlist",
        added: false
      }, { status: 200 });
    } else {
      // Add product if not in wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      return NextResponse.json({
        wishlist,
        message: "Product added to wishlist",
        added: true
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}