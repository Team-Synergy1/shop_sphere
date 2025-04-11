import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import bcrypt from "bcryptjs";
import { connectDB } from '@/lib/db';

export async function POST(request, { params }) {
  await connectDB();

  const { password } = await request.json();
  const { token } = await params;

  if (!password || !token) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Hash the token from params to compare with stored hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });
    }

    // Make Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set new password
    user.password = hashedPassword;

    // Clear reset fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Could not reset password' }, { status: 500 });
  }
}