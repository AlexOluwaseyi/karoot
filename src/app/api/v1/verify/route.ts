import ErrorHandler from "@/app/lib/ErrorHandler";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/cookieAuth";

export async function verifyUser(): Promise<Response> {
  try {
    // Authenticate the request
    const auth = await authenticateRequest();
    if (auth.error) {
      return auth.error;
    }

    const authUser = auth.user;
    if (!authUser) {
      return NextResponse.json({ message: "No authenticated user found." }, { status: 401 });
    }
    // const userId = authUser.userId;

    /**
    const cookieStore = await cookies(); // Access cookies
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenPayload = verifyToken(accessToken, "access");
    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = tokenPayload.userId;
    */

    // const user = await prisma.user.findUnique({ where: { userId: userId } });

    // if (!user) {
    //   return NextResponse.json({ message: "User not found." }, { status: 404 });
    // }
    if (authUser.isVerified) {
      return NextResponse.json({ message: "User already verified." }, { status: 400 });
    }

    // Update user verification status
    await prisma.user.update({
      where: { userId: authUser.userId },
      data: {
        isVerified: true,
        updatedAt: new Date()  // Update the updatedAt field
      },
    });



    return NextResponse.json({ message: "User verified." }, { status: 200 });
  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}