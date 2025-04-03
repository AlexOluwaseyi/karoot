import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/cookieAuth";

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
      where: { quizId: id },
    });

    // Check if no records are found
    if (!currentQuiz) {
      return NextResponse.json(
        { message: `Quiz '${id}' not found.` },
        { status: 404 }
      );
    }

    // Return the records
    return Response.json({ message: `Quiz '${id}' found.`, records: currentQuiz });
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
    // Authenticate the request
    const auth = await authenticateRequest(true); // Admin only
    if (auth.error) {
      return auth.error;
    }
    const authUser = auth.user;
    if (!authUser) {
      return NextResponse.json({ message: "No authenticated user found." }, { status: 401 });
    }

    /** Refactor cookie authentication
     *

    // Fetch cookies
    const cookieStore = await cookies(); // Access cookies
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Fetch payload from access token
    const currentUser = verifyToken(accessToken, "access");
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Fetch user record from database
    const userRecord = await prisma.user.findUnique({
      where: { userId: currentUser.userId },
    });

    if (!userRecord) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // Check if user is an admin
    if (!userRecord.isAdmin) {
      return NextResponse.json(
        { message: "Only administrators can update quizzes." },
        { status: 403 }
      );
    } */

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
      where: { quizId: id },
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

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: `QUIZ_UPDATE`,
        description: `Quiz '${id}' updated`,
        performedAt: new Date(),
        performerId: authUser.userId,
        targetId: currentQuiz.quizId,
      },
    });

    // Update the updatedAt field
    filteredBody.updatedAt = new Date();

    const updatedQuiz = await prisma.quiz.update({
      where: { quizId: id },
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
    // Authenticate the request
    const auth = await authenticateRequest(true); // Admin only
    if (auth.error) {
      return auth.error;
    }
    const authUser = auth.user;
    if (!authUser) {
      return NextResponse.json({ message: "No authenticated user found." }, { status: 401 });
    }

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
        quizId: id
      },
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
      where: { quizId: id },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: `QUIZ_DELETE`,
        description: `Quiz '${id}' deleted by ${authUser.username}`,
        performedAt: new Date(),
        performerId: authUser.userId,
        targetId: currentQuiz.quizId,
      },
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