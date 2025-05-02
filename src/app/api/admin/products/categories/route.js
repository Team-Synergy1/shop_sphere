import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectDB } from '@/lib/db';


export async function GET() {
  await connectDB();

  try {
    const categories = await Product.distinct('category');
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}