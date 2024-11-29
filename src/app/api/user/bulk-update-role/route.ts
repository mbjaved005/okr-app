import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt';
import { updateMultipleUsersRole } from '@/services/userService';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        console.log("Hello Decoded token:", decoded);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const updates = await request.json();
        console.log('Updates Arr:', updates);
        console.log('Updates Length:', updates.updates.length);
        if (updates.updates.length <= 0) {
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }
        for (const { userId, role } of updates.updates) {
            await updateMultipleUsersRole(userId, role);
        }
        return NextResponse.json({ message: 'Roles updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating roles:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}