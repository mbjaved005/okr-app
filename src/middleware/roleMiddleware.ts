import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/jwt'; // Import the verifyToken function

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (request: Request) => {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.error("Token not provided");
      return NextResponse.json({ message: 'Unauthorized: Token not provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      console.error("Unauthorized access attempt: Invalid token");
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Check if the user's role is allowed
    if (!allowedRoles.includes(decoded.role)) {
      console.error("Access denied for role:", decoded.role);
      return NextResponse.json({ message: 'Forbidden: You do not have permission to access this resource' }, { status: 403 });
    }

    // If the role is allowed, return null to indicate that the request can proceed
    return null; // Indicate that the request can proceed
  };
};