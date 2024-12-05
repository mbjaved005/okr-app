import { NextResponse } from "next/server";
import mongoose from "@/db/mongoose";
import OKR from "@/models/OKR";
import { verifyToken } from "@/utils/jwt";

export async function DELETE(request: Request) {
  console.log("Delete OKR API called");
  await mongoose.connection.readyState; // Check if the MongoDB connection is active

  const { id } = await request.json(); // Extract the OKR ID from the request body
  console.log("Deleting OKR with ID:", id); // Log the ID being deleted

  if (!id) {
    console.error("Delete error: OKR ID is required");
    return NextResponse.json(
      { message: "OKR ID is required" },
      { status: 400 }
    );
  }

  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      console.error("No token provided");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string") {
      console.error("Invalid token");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find and delete the OKR
    const result = await OKR.deleteOne({ _id: id, userId: decoded.id });
    if (result.deletedCount === 0) {
      console.error("Delete error: OKR not found or not authorized");
      return NextResponse.json(
        { message: "OKR not found or not authorized" },
        { status: 404 }
      );
    }

    console.log("OKR deleted successfully");
    return NextResponse.json(
      { message: "OKR deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during OKR deletion:", error);
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
