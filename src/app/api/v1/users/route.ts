import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    if (Object.keys(params).length !== 0) {
      const whereClause: Record<string, unknown> = {};

      if (params.email !== undefined) {
        whereClause.email = params.email;
      }
      if (params.fullname !== undefined) {
        whereClause.fullname = params.fullname;
      }
      if (params.username !== undefined) {
        whereClause.username = params.username;
      }

      const filteredUsers = await prisma.user.findMany({
        where: whereClause,
      });

      if (filteredUsers.length === 0) {
        return NextResponse.json(
          { message: "No users found matching the criteria." },
          { status: 200 }
        );
      }

      return Response.json({
        message: "Filtered users found",
        records: filteredUsers,
        count: filteredUsers.length,
      });
    }

    // Fetch all records
    const allUsers = await prisma.user.findMany();

    // Check if no records are found
    if (allUsers.length === 0) {
      return NextResponse.json({ message: "No users found." }, { status: 200 });
    }

    // Return the records
    return Response.json({
      message: "All users record found",
      records: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
