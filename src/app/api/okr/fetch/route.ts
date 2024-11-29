import { NextResponse } from 'next/server';
import OKR from '@/models/OKR';
import { verifyToken } from '@/utils/jwt';

export async function GET(request: Request) {
  try {
    console.log("Fetch OKRs API called");
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const okrs = await OKR.find({ userId: decoded.id });
    console.log("Fetched OKRs:", okrs); // Log the fetched OKRs
    return NextResponse.json(okrs);
  } catch (error) {
    console.error('Error fetching OKRs:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}