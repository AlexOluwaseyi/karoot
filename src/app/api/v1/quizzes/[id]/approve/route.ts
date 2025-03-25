import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    // If id not in params
    if (!id) {
      return NextResponse.json(
        { message: "Quiz ID not provided." },
        { status: 400 }
      );
    }

    // Fetch quiz by ID
    const currentQuiz = await prisma.quiz.findUnique({
      where: { quizId: id },
    });

    if (!currentQuiz) {
      return NextResponse.json(
        { message: `Quiz '${id}' not found.` },
        { status: 404 }
      );
    }

    const approvedQuiz = await prisma.quiz.update({
      where: { quizId: id },
      data: {
        approved: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `Quiz ${id} approved.`, data: approvedQuiz },
      { status: 200 }
    );
  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
