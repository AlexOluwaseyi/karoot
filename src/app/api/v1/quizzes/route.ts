import { NextResponse } from "next/server";
import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request): Promise<Response> {
  try {
    // Construct to query quizzes
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);

    const whereClause: Record<string, unknown> = {};

    if (Object.keys(params).length !== 0) {
      // Handle approved param
      if (params.approved !== undefined) {
        whereClause.approved = params.approved === "true" ? true : false;
      }
      if (params.flagged !== undefined) {
        whereClause.flagged = params.flagged === "true" ? true : false;
      }
      if (params.category !== undefined) {
        whereClause.category = params.category;
      }
      if (params.submittedBy !== undefined) {
        whereClause.submittedBy = params.submittedBy;
      }

      // Fetch all records
      const filteredQuizzes = await prisma.quiz.findMany({
        where: whereClause
      });

      // Check if no records are found
      if (filteredQuizzes.length === 0) {
        return NextResponse.json(
          { message: "No quizzes found matching the criteria." },
          { status: 200 }
        );
      }

      // Return the records
      return Response.json({
        message: "Filtered quizzes found",
        records: filteredQuizzes,
        count: filteredQuizzes.length,
      });
    }

    // Fetch all records
    const allQuizzes = await prisma.quiz.findMany();

    // Check if no records are found
    if (allQuizzes.length === 0) {
      return NextResponse.json(
        { message: "No quizzes found." },
        { status: 200 }
      );
    }

    // Return the records
    return Response.json({
      message: "All quizzes records found",
      records: allQuizzes,
      count: allQuizzes.length,
    });
  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
