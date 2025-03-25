import { NextResponse } from "next/server";
import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Check if the request body is empty
    if (!body) {
      return NextResponse.json(
        { message: "Data not sent in request." },
        { status: 400 }
      );
    }

    if (
      !body.question ||
      !body.category ||
      !body.options ||
      !body.answer ||
      !body.submittedBy
    ) {
      return NextResponse.json(
        { message: "Required fields missing." },
        { status: 400 }
      );
    }

    const newQuizSubmission = await prisma.quiz.create({
      data: {
        question: body.question,
        category: body.category,
        options: body.options,
        answer: body.answer,
        submittedBy: body.submittedBy,
      },
    });

    console.log(newQuizSubmission);
    return NextResponse.json(
      { message: "Data received.", data: newQuizSubmission },
      { status: 200 }
    );
  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
