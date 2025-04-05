import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

// Generate and hash OTP verification code
export async function hashOTP(): Promise<{
    plainOTP: string;
    hashedOTP: string;
}> {
    if (!saltRounds) {
        throw new Error("Salt rounds not set in environment variables.");
    }
    if (isNaN(saltRounds)) {
        throw new Error("Salt rounds must be a number.");
    }

    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedOTP = await bcrypt.hash(otp, salt);
        return { plainOTP: otp, hashedOTP: hashedOTP };
    } catch (error) {
        console.error("Error hashing OTP:", error);
        throw new Error(`OTP hashing failed: ${error}.`);
    }
}

export async function generateOTP(userId: string): Promise<string> {
    if (!userId) {
        throw new Error("User ID is required to generate OTP.");
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
        where: { userId },
    });

    if (!user) {
        throw new Error("User not found.");
    }

    const { plainOTP, hashedOTP } = await hashOTP();

    if (!plainOTP || !hashedOTP) {
        throw new Error("Failed to generate OTP.");
    }

    // Save the hashed OTP to the database
    await prisma.otp.create({
        data: {
            userId,
            hashedOTP: hashedOTP,
            attempts: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }, // OTP valid for 5 minutes
    });

    return plainOTP;
}

// Validate OTP expiry and attempts
export async function validateOTPStatus(otpData: {
    attempts: number;
    expiresAt: Date;
}) {
    const now = new Date();
    const expiredAt = new Date(otpData.expiresAt);

    if (now > expiredAt) {
        throw new Error("OTP has expired");
    }

    if (otpData.attempts >= 3) {
        throw new Error("Maximum OTP attempts exceeded");
    }
}

// Check hashed OTP for verification
export async function checkOTP(userId: string, otp: string) {
    try {
        if (!userId) {
            throw new Error("User ID is required for OTP verification.");
        }
        if (!otp) {
            throw new Error("OTP is required for verification.");
        }
        // await validateOTPStatus(user.hashedOTP);
        // Check if the OTP record exists in the database
        const userOTP = await prisma.otp.findFirst({
            where: {
                userId,
                attempts: { lt: 3 }, // Allow up to 3 attempts
                expiresAt: { gte: new Date() } // Check if OTP is not expired
            },
        });
        if (!userOTP) {
            throw new Error("No OTP record found or OTP has expired.");
        }
        // Increment the attempts count
        await prisma.otp.update({
            where: {
                id: userOTP.id,
                userId
            },
            data: {
                attempts: { increment: 1 },
            },
        });
        const isMatch = await bcrypt.compare(otp, userOTP.hashedOTP);
        return isMatch;
    } catch (error) {
        throw new Error(`Error checking OTP: ${error}`);
    }
}
