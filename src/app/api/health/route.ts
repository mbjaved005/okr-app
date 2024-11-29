import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Health check endpoint hit");
    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error("Error in health check endpoint:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}