import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {connectDB} from '@/lib/db';
import User from '@/models/User';
import { sendResetEmail } from '@/lib/email';

export async function POST(request) {
  await connectDB();
  
  const { email } = await request.json();
  
  if (!email) {
    return NextResponse.json({ success: false, message: 'Please provide an email address' }, { status: 400 });
  }
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ success: true, message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log(resetToken);
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expire time - 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    await sendResetEmail(user.email, resetUrl);
    
    return NextResponse.json({ success: true, message: 'A Password reset link sent to your email' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Email could not be sent' }, { status: 500 });
  }
}