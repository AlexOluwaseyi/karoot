import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/auth/cookieAuth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(true);
    if (auth.error) {
      return auth.error;
    }
    const authUser = auth.user;
    if (!authUser) {
      return NextResponse.json({ message: "No authenticated user found." }, { status: 401 });
    }
    // // Fetch user record from database
    // const currentUser = await prisma.user.findUnique({
    //   where: { userId: authUser.userId },
    // });
    // if (!currentUser) {
    //   return NextResponse.json({ message: "User not found." }, { status: 401 });
    // }
    /** Refactor cookie authentication
     * 
    // Fetch cookies
    const cookieStore = await cookies(); // Access cookies
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Fetch payload from access token
    const tokenPayload = verifyToken(accessToken, "access");
    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await prisma.user.findUnique({
      where: { userId: tokenPayload.userId },
    });
    if (!currentUser) {
      return NextResponse.json({ message: "User not found." }, { status: 401 });
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

    // Update the quiz to flagged
    const flaggedQuiz = await prisma.quiz.update({
      where: { quizId: id },
      data: {
        flagged: true,
        updatedAt: new Date(),
      },
    });

    // Log audit entry for flagging the quiz
    await prisma.auditLog.create({
      data: {
        action: `FLAG_QUIZ`,
        description: `Quiz ${id} flagged by ${authUser.username}`,
        performedAt: new Date(),
        performerId: authUser.userId,
        targetId: currentQuiz.quizId,
      },
    });

    return NextResponse.json(
      { message: `Quiz ${id} flagged.`, data: flaggedQuiz },
      { status: 200 }
    );
  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
