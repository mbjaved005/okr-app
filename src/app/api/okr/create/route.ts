import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import OKR from '@/models/OKR';

export async function POST(request: Request) {
  try {
    console.log("Create OKR API called"); // Log when the API is called

    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in the environment variables'); // Log error if MONGODB_URI is not set
      }
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB"); // Log successful connection
    }

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, startDate, endDate, category, owners, vertical } = await request.json(); // Include owners here
    console.log("Received OKR data:", { title, description, startDate, endDate, category, owners, vertical }); // Log received data

    const newOKR = new OKR({
      title,
      description,
      startDate,
      endDate,
      category,
      owner: owners, // Store owners as an array
      vertical,
      userId: decoded.id,
    });

    await newOKR.save();
    console.log('OKR created successfully:', newOKR);
    return NextResponse.json({ message: 'OKR created successfully' });
  } catch (error) {
    console.error('Error creating OKR:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}