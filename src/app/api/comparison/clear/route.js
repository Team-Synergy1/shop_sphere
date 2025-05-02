import { NextResponse } from 'next/server';
import Comparison from '@/models/Comparison';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function DELETE(request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  try {
    // Delete all comparisons for this user/session
    const result = await Comparison.deleteMany({
      $or: [
        { user: session?.user?.id },
        { sessionId: session?.user ? null : sessionId }
      ]
    });

    // Clear the session cookie if it exists (for anonymous users)
    if (sessionId && !session?.user) {
      cookieStore.delete('sessionId');
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear comparison',
        message: error.message 
      },
      { status: 500 }
    );
  }
}