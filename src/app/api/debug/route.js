// src/app/api/debug/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    return NextResponse.json({
      status: 'success',
      message: 'API is working correctly',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : null
    }, { status: 500 });
  }
}