// File: /app/api/admin/products/[id]/route.js
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";


export async function PUT(request, { params }) {
  await connectDB();
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}


export async function GET(request, { params }) {
  await connectDB();
  
  try {
    const { id } = await params;
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('subcategory', 'name');
    
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch product', error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  await connectDB();
  
  try {
    const { id } = await params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}