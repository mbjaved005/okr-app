import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import mongoose from '@/db/mongoose';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  console.log("Login API called");
  await mongoose.connection.readyState; // Check if the MongoDB connection is active
  const { email, password } = await request.json();

  console.log("Login attempt for email:", email);

  // Check if all fields are provided
  if (!email || !password) {
    console.error("Login error: All fields are required");
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Check if the user exists
  try {
    const user = await User.findOne({ email });
    console.log("User found:", !!user);

    if (!user) {
      console.error("Login error: Invalid credentials - user not found");
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password verification result:", isMatch);

    if (!isMatch) {
      console.error("Login error: Invalid credentials - password mismatch");
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not defined");
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Login successful, token created");

    // Log the response being sent
    console.log("Sending login response:", { success: true, token: token.substring(0, 10) + '...', fullName: user.fullName });

    return NextResponse.json({ message: 'Login successful', token, fullName: user.fullName }, { status: 200 });
  } catch (err) {
    console.error("Error during login:", err);
    console.error("Stack trace:", err instanceof Error ? err.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}