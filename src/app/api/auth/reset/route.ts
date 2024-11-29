import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { token, oldPassword, newPassword } = await request.json();

  if (!token || !oldPassword || !newPassword) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.error('Invalid or expired token');
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      console.error('Old password is incorrect');
      return NextResponse.json({ message: 'Old password is incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);
    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/auth/reset:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


// This implementation:

// 1. Handles the POST request for password reset.
// 2. Validates that all required fields (token, oldPassword, newPassword) are provided.
// 3. Finds the user with the given reset token and checks if it's still valid.
// 4. Verifies that the old password is correct.
// 5. Hashes the new password and updates the user's record.
// 6. Clears the reset token and its expiration after successful password reset.
// 7. Includes error handling and logging for various scenarios.
// 8. Returns appropriate responses based on the outcome of the operation.

// This implementation aligns with the existing project structure and coding style, and it addresses the password reset functionality as requested in the development instructions.