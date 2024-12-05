import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import OKR from "@/models/OKR";

export async function GET(request: Request) {
  try {
    console.log("Fetch OKR API called");
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
    console.log("Fetching OKRs for user ID:", userId); // Log the user ID being fetched

    const okrs = await OKR.find({ userId: userId }); // Fetch OKRs created by the logged-in user
    if (!okrs.length) {
      console.error("No OKRs found for user ID:", userId); // Log if no OKRs are found
      return NextResponse.json({ message: "No OKRs found" }, { status: 404 });
    }

    console.log("Fetched OKRs:", okrs); // Log the fetched OKRs
    return NextResponse.json(okrs);
  } catch (error) {
    console.error("Error fetching OKR:", error);
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
