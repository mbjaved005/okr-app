import User from "@/models/User";
import { verifyToken } from "@/utils/jwt";
import { roleMiddleware } from "@/middleware/roleMiddleware"; // Import the middleware
import { NextResponse } from "next/server";
const path = require("path");
const envPath = path.resolve(__dirname, "../../.env");
require("dotenv").config({ debug: true, path: envPath });

const checkRole = roleMiddleware(["Admin"]); // Only Admin can delete user

export async function DELETE(request: Request) {
  const roleCheckResponse = await checkRole(request);
  if (roleCheckResponse) return roleCheckResponse; // If unauthorized, return response

  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  const { email } = await request.json();
  console.log("Incoming request data:", { email });

  let user;
  if (decoded && typeof decoded !== "string" && "id" in decoded) {
    try {
      user = await User.findOne({ email });
      console.log("User found:", user);
    } catch (error) {
      console.error("Error finding user:", error);
      return NextResponse.json("Failed to find user", { status: 500 });
    }
  } else {
    console.error("Invalid token payload");
    return NextResponse.json("Unauthorized", { status: 401 });
  }
  if (!user) {
    console.error("User not found with email:", email);
    return NextResponse.json("User not found", { status: 404 });
  }

  try {
    console.log("Deleting user:", user);
    const result = await User.deleteOne({ email });
    console.log("User deleted successfully:", { email: user.email });
    if (result.deletedCount === 0) {
      console.error("Delete error: User not found ");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User deleted successfully");
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json("Failed to delete user", { status: 500 });
  }
}
