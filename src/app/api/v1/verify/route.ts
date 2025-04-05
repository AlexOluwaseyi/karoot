import ErrorHandler from "@/app/lib/ErrorHandler";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateRequest } from "@/app/lib/auth/cookieAuth";
import { checkOTP } from "@/app/lib/auth/otpAuth";

export async function verifyUser(request: Request): Promise<Response> {
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

    if (authUser.isVerified) {
      return NextResponse.json({ message: "User already verified." }, { status: 400 });
    }

    // Get OTP from request body
    const body = await request.json()

    if (!body || !body.otp) {
      return NextResponse.json({ message: "OTP not provided." }, { status: 400 })
    }

    const { otp } = body

    const otpMatch = await checkOTP(authUser.userId, otp);

    if (!otpMatch) {
      return NextResponse.json(
        { message: "OTP does not match or has expired." },
        { status: 400 }
      );
    }
    // Update user verification status
    await prisma.user.update({
      where: { userId: authUser.userId },
      data: {
        isVerified: true,
        updatedAt: new Date()  // Update the updatedAt field
      },
    });

    // Update auditlog entry for OTP verification
    await prisma.auditLog.create({
      data: {
        action: "OTP Verification",
        description: `OTP Verification for User ${authUser.userId} successful`,
        performerId: authUser.userId,
      }
    });

    
    // Success case: you can return a success response or continue logic here
    return NextResponse.json(
      { message: "OTP verified successfully." },
      { status: 200 }
    );

  } catch (error) {
    const { status, message } = ErrorHandler(error);
    return NextResponse.json({ message: message }, { status });
  }
}
