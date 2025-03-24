import ErrorHandler from "@/app/lib/ErrorHandler";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import isEmail from "validator/lib/isEmail";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
): Promise<Response> {
  try {
    // Fetch param from params
    const { param } = await params;

    // If param not in params
    if (!param) {
      return NextResponse.json(
        { message: "User ID or email not provided." },
        { status: 400 }
      );
    }

    // Check if param is email
    const emailOrId = isEmail(param) ? { email: param } : { userId: param };
    console.log(emailOrId)

    // Fetch user by email or id
    const currentUser = await prisma.user.findUnique({
      where: emailOrId,
    });

    // Check if no records are found
    if (!currentUser) {
      return NextResponse.json(
        { message: `User '${param}' not found.` },
        { status: 404 }
      );
    }

    // Return the records
    return Response.json({ message: "User found", Records: currentUser });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ param: string }> }
): Promise<Response> {
  try {
    // Fetch param from params
    const { param } = await params;

    // If param not in params
    if (!param) {
      return NextResponse.json(
        { message: "User ID or email not provided." },
        { status: 400 }
      );
    }

    // Check if param is email or userId
    const emailOrId = isEmail(param) ? { email: param } : { userId: param };
    console.log(emailOrId);

    // Fetch user by email or id
    const currentUser = await prisma.user.findUnique({
      where: emailOrId,
    });

    // Check if no records are found
    if (!currentUser) {
      return NextResponse.json(
        { message: `User '${param}' not found.` },
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

    // Get the allowed fields from your User model
    const allowedFields = [
      "email", // Update and reset isVerified
      // 'username', // Can never be updated
      "phone", // Update and reset isVerified
      // 'hashedPassword',
      // 'hashedOTP',
      "fullname",
      "isVerified",
      "history",
      "quizCount",
      "currentScore",
      "rank",
    ];

    // Filter out the allowed fields from the body
    const filteredBody = Object.keys(body).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    // If email or phone is updated, reset isVerified
    if (filteredBody.email || filteredBody.phone) {
      filteredBody.isVerified = false;
    }

    // Update the updatedAt field
    filteredBody.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: emailOrId,
      data: filteredBody,
    });

    // Return the records
    return Response.json({
      message: `User '${param}' updated`,
      Records: updatedUser,
    });
  } catch (error) {
    // Handle errors
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
