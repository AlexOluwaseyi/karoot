import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import ErrorHandler from "@@/lib/ErrorHandler";
import { manageTokens } from "@/app/lib/auth/jwtAuth";
import { checkPassword } from "@/app/lib/auth/password";
import isEmail from "validator/lib/isEmail";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { message: "Data not sent in request." },
        { status: 400 }
      );
    }

    if (!body.cred || !body.password) {
      return NextResponse.json(
        { message: "Required fields missing." },
        { status: 400 }
      );
    }

    // Check if the user entered username or email
    const emailOrUsername = isEmail(body.cred)
      ? { email: body.cred }
      : { username: body.cred };

    const user = await prisma.user.findUnique({
      where: emailOrUsername,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const passwordMatch = await checkPassword(user.userId, body.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Password incorrect." },
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
