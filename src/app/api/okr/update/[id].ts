import { NextResponse } from "next/server";
import OKR from "@/models/OKR";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { keyResults } = await request.json();
  try {
    const updatedOKR = await OKR.findByIdAndUpdate(
      id,
      { keyResults },
      { new: true }
    );
    if (!updatedOKR) {
      return NextResponse.json({ message: "OKR not found" }, { status: 404 });
    }
    return NextResponse.json(updatedOKR);
  } catch (error) {
    console.error("Error updating OKR:", error);
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
