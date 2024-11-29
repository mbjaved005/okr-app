import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import mongoose from '@/db/mongoose';

export async function POST(request: Request) {
  console.log("Received registration request");
  await mongoose.connection.readyState; // Check if the MongoDB connection is active
  console.log("MongoDB connection state:", mongoose.connection.readyState); // Log the connection state
  const { fullName, email, password, role } = await request.json();
  console.log("Registration data received:", { fullName, email, password, role });

  // Check if all fields are provided
  console.log("Checking if all fields are provided");
  if (!fullName || !email || !password || !role) {
    console.error("Registration error: All fields are required");
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  // Validate email format
  console.log("Validating email format");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Registration error: Invalid email format");
    return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
  }

  // Ensure role is valid
  const validRoles = ['Employee', 'Manager', 'Admin'];
  if (!validRoles.includes(role)) {
    console.error("Registration error: Invalid role");
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  }

  // Check if user already exists
  console.log("Checking if user already exists in the database");
  try {
    const existingUser = await User.findOne({ email });
    console.log("Existing user check result:", existingUser);
    if (existingUser) {
      console.error("Registration error: User already exists");
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }
  } catch (err) {
    console.error("Database query error while checking existing user:", err);
    console.error("Stack trace:", err instanceof Error ? err.stack : "No stack trace available"); // Log the stack trace for better debugging
    return NextResponse.json({ message: 'Internal server error', error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  // Hash the password
  try {
    console.log("Attempting to hash the password");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Create new user with the specified role
    const user = new User({ fullName, email, password: hashedPassword, role });
    console.log("Attempting to save new user to the database");
    await user.save();
    console.log("User registered successfully:", { fullName, email, role });
  } catch (err) {
    console.error("Error saving user to the database:", err);
    console.error("Stack trace:", err instanceof Error ? err.stack : "No stack trace available"); // Log the stack trace for better debugging
    return NextResponse.json({ message: 'Internal server error', error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
}