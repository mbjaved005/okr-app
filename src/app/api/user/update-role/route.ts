import { NextResponse } from 'next/server';
import User from '@/models/User';
import { verifyToken } from '@/utils/jwt';
import { roleMiddleware } from '@/middleware/roleMiddleware';

const checkRole = roleMiddleware(['Admin']); // Only Admin can update user roles

export async function POST(request: Request) {
  const roleCheckResponse = await checkRole(request);
  if (roleCheckResponse) return roleCheckResponse; // If unauthorized, return response

  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ message: 'Missing userId or role' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.role = role;
    await user.save();

    console.log(`User role updated successfully for userId: ${userId}, new role: ${role}`);
    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}