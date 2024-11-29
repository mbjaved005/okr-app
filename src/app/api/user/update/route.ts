import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { verifyToken } from '@/utils/jwt';
import { roleMiddleware } from '@/middleware/roleMiddleware'; // Import the middleware
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
require("dotenv").config({ debug: true, path: envPath });
// Apply the middleware to this route
const checkRole = roleMiddleware(['Admin', 'Manager']); // Only Admin and Manager can update user info

export async function POST(request: Request) {
  const roleCheckResponse = await checkRole(request);
  if (roleCheckResponse) return roleCheckResponse; // If unauthorized, return response

  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in the environment variables');
      }
      await mongoose.connect(mongoUri);
    }
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { fullName, email, role } = await request.json();
    console.log("Incoming request data:", { fullName, email, role });

    let user;
    if (decoded && typeof decoded !== 'string' && 'id' in decoded) {
      user = await User.findById(decoded.id);
      console.log("User found:", user);
    } else {
      console.error("Invalid token payload");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!user) {
      console.error("User not found with ID:", decoded.id);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log("Before update:", user);
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.role = role || user.role;

    console.log("Saving user with updated data:", { fullName: user.fullName, email: user.email, role: user.role });
    await user.save();
    console.log("User updated successfully:", { id: user._id, fullName: user.fullName, email: user.email, role: user.role });
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}