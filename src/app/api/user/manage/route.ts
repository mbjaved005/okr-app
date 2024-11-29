import { NextResponse } from 'next/server';
import { roleMiddleware } from '@/middleware/roleMiddleware';

const checkRole = roleMiddleware(['Admin']); // Only Admin can manage users

export const POST = checkRole(async (request: Request) => {
  try {
    // Your route logic here
    return NextResponse.json({ message: 'User management action performed successfully' });
  } catch (error) {
    console.error('Error in user management route:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
});