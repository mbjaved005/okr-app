import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import OKR from '@/models/OKR';

export async function PUT(request: Request) {
  try {
    console.log("Edit OKR API called");
    console.log("Request headers:", request.headers);

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('MongoDB URI is not defined in environment variables');
        throw new Error('MONGODB_URI is not defined in the environment variables');
      }
      console.log("Connecting to MongoDB...");
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB successfully");
    }

    // Verify authorization token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json({ message: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      console.error('Invalid or expired token:', typeof decoded === 'string' ? decoded : 'Token verification failed');
      return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
    }
    console.log("Token verified successfully. User ID:", decoded.id);

    // Parse and validate request body
    const { id, title, description, startDate, endDate, category } = await request.json();
    console.log("Received OKR update data:", { id, title, description, startDate, endDate, category });

    // Validate required fields
    if (!id || !title || !description || !startDate || !endDate || !category) {
      console.error('Missing required fields in update request');
      return NextResponse.json({ 
        message: 'Missing required fields', 
        details: 'All fields (id, title, description, startDate, endDate, category) are required' 
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date format provided');
      return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }
    if (end < start) {
      console.error('End date cannot be before start date');
      return NextResponse.json({ message: 'End date must be after start date' }, { status: 400 });
    }

    // Check if OKR exists and belongs to the user
    const existingOKR = await OKR.findById(id);
    if (!existingOKR) {
      console.error(`OKR with ID ${id} not found`);
      return NextResponse.json({ message: 'OKR not found' }, { status: 404 });
    }
    if (existingOKR.userId.toString() !== decoded.id) {
      console.error(`User ${decoded.id} attempted to edit OKR ${id} belonging to user ${existingOKR.userId}`);
      return NextResponse.json({ message: 'Unauthorized to edit this OKR' }, { status: 403 });
    }

    // Update OKR
    console.log("Attempting to update OKR with ID:", id);
    const updatedOKR = await OKR.findByIdAndUpdate(id, {
      title,
      description,
      startDate,
      endDate,
      category,
    }, { 
      new: true,
      runValidators: true
    });

    if (!updatedOKR) {
      console.error('Failed to update OKR despite passing initial checks');
      return NextResponse.json({ message: 'Failed to update OKR' }, { status: 500 });
    }

    console.log('OKR updated successfully:', updatedOKR);
    return NextResponse.json({ 
      message: 'OKR updated successfully', 
      updatedOKR 
    });
  } catch (error) {
    console.error('Error updating OKR:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ 
        message: 'Validation error', 
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}