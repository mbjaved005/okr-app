import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import { getUsers } from '../../../../services/userService'; // Assume this service fetches users from the database

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const users = await getUsers();
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}