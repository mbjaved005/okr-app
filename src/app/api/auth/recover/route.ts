import { NextResponse } from 'next/server';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

async function sendPasswordRecoveryEmail(email: string, resetLink: string) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Recovery',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
           <a href="${resetLink}">Reset Password</a>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
    await sendPasswordRecoveryEmail(email, resetLink);

    console.log(`Password reset link sent to ${email}`);
    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/auth/recover:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}