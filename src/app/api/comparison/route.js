import { NextResponse } from 'next/server';
import Comparison from '@/models/Comparison';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function POST(request) {
  await connectDB();
  const { productId } = await request.json();
  const session = await getServerSession(authOptions);
  
  // Handle session ID for both authenticated and anonymous users
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('sessionId')?.value;

  if (!session?.user && !sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });
  }

  try {
    let comparison = await Comparison.findOne({
      $or: [
        { user: session?.user?.id }, 
        { sessionId: session?.user ? null : sessionId }
      ]
    });

    if (!comparison) {
      comparison = new Comparison({
        user: session?.user?.id || null,
        sessionId: session?.user ? null : sessionId,
        products: [productId]
      });
    } else if (!comparison.products.includes(productId)) {
      comparison.products.push(productId);
      // Limit to 4 products max
      if (comparison.products.length > 4) {
        comparison.products.shift();
      }
    }

    await comparison.save();
    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add product to comparison' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  try {
    const comparison = await Comparison.findOne({
      $or: [
        { user: session?.user?.id },
        { sessionId: session?.user ? null : sessionId }
      ]
    }).populate('products');

    return NextResponse.json(comparison || { products: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comparison' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  await connectDB();
  const { productId } = await request.json();
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const sessionId =  cookieStore.get('sessionId')?.value;

  try {
    const comparison = await Comparison.findOne({
      $or: [
        { user: session?.user?.id },
        { sessionId: session?.user ? null : sessionId }
      ]
    });

    if (comparison) {
      comparison.products = comparison.products.filter(
        id => id.toString() !== productId
      );
      await comparison.save();
    }

    return NextResponse.json(comparison || { products: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove product from comparison' },
      { status: 500 }
    );
  }
}