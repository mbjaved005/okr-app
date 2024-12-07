import { NextResponse } from "next/server";
import mongoose from "@/db/mongoose";
import OKR from "@/models/OKR";
import { verifyToken } from "@/utils/jwt";

export async function PUT(request: Request) {
  await mongoose.connection.readyState; // Check if the MongoDB connection is active
  const {
    id,
    title,
    description,
    startDate,
    endDate,
    category,
    vertical,
    owners,
  } = await request.json();
  console.log("Edit request:", {
    id,
    title,
    description,
    startDate,
    endDate,
    category,
    vertical,
    owners,
  });
  if (
    !id ||
    !title ||
    !description ||
    !startDate ||
    !endDate ||
    !category ||
    !vertical ||
    !owners
  ) {
    console.error("Edit error: All fields are required");
    return NextResponse.json(
      { message: "All fields are required" },
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

    const userId = decoded.id; // Get the user ID from the decoded token

    const okr = await OKR.findOneAndUpdate(
      { _id: id, userId: userId },
      { title, description, startDate, endDate, category, vertical, owners },
      { new: true }
    );

    if (!okr) {
      console.error("Edit error: OKR not found or not authorized");
      return NextResponse.json(
        { message: "OKR not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "OKR updated successfully", okr },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during OKR edit:", error);
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
