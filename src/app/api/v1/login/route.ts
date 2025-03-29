import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import ErrorHandler from "@@/lib/ErrorHandler";
import { manageTokens } from "@/app/lib/auth/jwt";
import { checkPassword } from "@/app/lib/auth/password";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { message: "Data not sent in request." },
        { status: 400 }
      );
    }

    if (!body.username || !body.password) {
      return NextResponse.json(
        { message: "Required fields missing." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const passwordMatch = await checkPassword(user.userId, body.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid password." },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = manageTokens({
      userId: user.userId,
      username: user.username,
      email: user.email,
    });



    const response = NextResponse.json(
      { message: "Login successful.", accessToken, refreshToken },
      { status: 200 }
    );

    // Set tokens in cookie
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 1800,
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });

    return response;

  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
