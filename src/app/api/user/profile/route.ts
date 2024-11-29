import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User'; // Ensure the correct path to User model
import { verifyToken } from '@/utils/jwt'; // Import the verifyToken function

export async function GET(request: Request) {
  try {
    await mongoose.connection.readyState; // Check if the MongoDB connection is active
    const token = request.headers.get('Authorization')?.split(' ')[1]; // Extract the token from the headers
    if (!token) {
      console.error("Token not provided");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token); // Verify the token
    if (!decoded || typeof decoded === 'string') {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.id).select('-password -__v'); // Exclude the password and version
    if (!user) {
      console.error("User not found with ID:", decoded.id);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log("Fetched user data:", user); // Log the fetched user data
    return NextResponse.json({ fullName: user.fullName, email: user.email, role: user.role, permissions: user.permissions }); // Include permissions in the response
  } catch (error) {
    console.error('Error fetching user profile:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}