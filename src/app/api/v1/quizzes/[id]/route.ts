import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Fetch id from params
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
      where: {quizId: id},
    });

    // Check if no records are found
    if (!currentQuiz) {
      return NextResponse.json(
        { message: `Quiz '${id}' not found.` },
        { status: 404 }
      );
    }

    // Return the records
    return Response.json({ message: `Quiz '${id}' found.` , records: currentQuiz });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Fetch id from params
    const { id } = await params;

    // If id not in params
    if (!id) {
      return NextResponse.json(
        { message: "Quiz ID not provided." },
        { status: 400 }
      );
    }

    // Find quiz by ID
    const currentQuiz = await prisma.quiz.findUnique({
      where: {quizId: id},
    });

    // Check if no records are found
    if (!currentQuiz) {
      return NextResponse.json(
        { message: `Quiz '${id}' not found.` },
        { status: 404 }
      );
    }

    // Parse the request body as JSON
    const body = await request.json();

    // Check if the request body is empty
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "Data not sent in request." },
        { status: 400 }
      );
    }

    // Get the allowed fields from your Quiz model
    const allowedFields = [
      "question",
      "category",
      "options",
      "answer",
      // "flagged", 
      // "approved" 
    ];

    // Check if the request body contains any disallowed fields
    const disallowedFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );
    if (disallowedFields.length > 0) {
      return NextResponse.json(
        { message: `Disallowed fields: ${disallowedFields.join(", ")}` },
        { status: 403 }
      );
    }

    // Filter out the allowed fields from the body
    const filteredBody = Object.keys(body).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    // If question, category, options, answers updated, reset flagged and approved
    if (filteredBody.question || filteredBody.category || filteredBody.options || filteredBody.answer) {
      filteredBody.flagged = false;
      filteredBody.approved = false;
    }

    // Update the updatedAt field
    filteredBody.updatedAt = new Date();

    const updatedQuiz = await prisma.quiz.update({
      where: {quizId: id},
      data: filteredBody,
    });

    // Return the records
    return Response.json({
      message: `Quiz '${id}' updated`,
      records: updatedQuiz,
    });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Fetch id from params
    const { id } = await params;

    // If id not in params
    if (!id) {
      return NextResponse.json(
        { message: "Quiz ID not provided." },
        { status: 400 }
      );
    }

    // Fetch quiz byy ID
    const currentQuiz = await prisma.quiz.findUnique({
      where: {
        quizId:  id},
    });

    // Check if no records are found
    if (!currentQuiz) {
      return NextResponse.json(
        { message: `Quiz '${id}' not found.` },
        { status: 404 }
      );
    }

    // Delete the quiz
    await prisma.quiz.delete({
      where: {quizId: id},
    });

    // Return the records
    return Response.json({
      message: `Quiz '${id}' deleted`,
    });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}