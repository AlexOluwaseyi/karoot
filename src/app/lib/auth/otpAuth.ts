import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

// interface hashedOTP {
//     OTP?: string
//     attempts?: number
//     createdAt?: string
//     expiredAt?: string
// }

// Generate and hash OTP verification code
export async function hashOTP(): Promise<{ plainOTP: string; hashedOTP: string }> {
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
};

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
    const hashedOTPData = {
        OTP: hashedOTP,
        attempts: 0,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 5 minutes
    }

    await prisma.user.update({
        where: { userId },
        data: {
            hashedOTP: hashedOTPData,
            updatedAt: new Date(), // Update the updatedAt field
        },
    });

    return plainOTP;

};

// Validate OTP expiry and attempts
export async function validateOTPStatus(otpData: { attempts: number; expiredAt: Date }) {
    const now = new Date();
    const expiredAt = new Date(otpData.expiredAt);

    if (now > expiredAt) {
        throw new Error("OTP has expired");
    }

    if (otpData.attempts >= 3) {
        throw new Error("Maximum OTP attempts exceeded");
    }
}

// Check hashed OTP for verification
export async function checkOTP(user: { hashedOTP: { OTP: string; attempts: number; expiredAt: Date } }, otp: string) {
    try {
        if (!user || !user.hashedOTP) {
            throw new Error("User or hashed OTP not found.");
        }
        if (!otp) {
            throw new Error("OTP is required for verification.");
        }
        await validateOTPStatus(user.hashedOTP);
        const checkResult = await bcrypt.compare(otp, user.hashedOTP.OTP);
        return checkResult;
    } catch (error) {
        throw new Error(`Error checking OTP: ${error}`);
    }
}