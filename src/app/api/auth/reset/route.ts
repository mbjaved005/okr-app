import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, oldPassword, newPassword } = await request.json();

  if (!token || !oldPassword || !newPassword) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.error("Invalid or expired token");
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      console.error("Old password is incorrect");
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    console.log("Password reset successful for user:", user.email);
    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/auth/reset:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
