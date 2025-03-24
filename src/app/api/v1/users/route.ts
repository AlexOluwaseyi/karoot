import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  try {
    // Fetch all records
    const allUsers = await prisma.user.findMany();

    // Check if no records are found
    if (allUsers.length === 0) {
      return NextResponse.json({ message: "No users found." }, { status: 200 });
    }

    // Return the records
    return Response.json({ message: "Records found", Records: allUsers });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
