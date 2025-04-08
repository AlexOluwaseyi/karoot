import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./jwtAuth";
import prisma from "../prisma";
import { User } from "@prisma/client";

/**
 * Authentication result containing the validated user or error response
 */
export interface AuthResult {
    user?: User;
    error?: NextResponse;
    isAdmin?: boolean | null;
}

/**
 * Authenticates a request by extracting and validating the access token from cookies
 * @param requireAdmin - Whether to check if the user is an admin
 * @returns The authenticated user or an error response
 */
export async function authenticateRequest(requireAdmin = false): Promise<AuthResult> {
    try {
        // Get access token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return {
                error: NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                )
            };
        }

        const tokenPayload = await verifyToken(accessToken, "access");

        if (!tokenPayload) {
            return {
                error: NextResponse.json(
                    { message: "Invalid token" },
                    { status: 401 }
                )
            };
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { userId: tokenPayload.userId },
        });

        if (!user) {
            return {
                error: NextResponse.json(
                    { message: "User not found" },
                    { status: 401 }
                )
            };
        }

        // Check admin status if required
        if (requireAdmin && !user.isAdmin) {
            return {
                error: NextResponse.json(
                    { message: "Admin permission required" },
                    { status: 403 }
                )
            };
        }

        // Authentication successful
        return {
            user,
            isAdmin: user.isAdmin
        };
    } catch (error) {
        console.error("Authentication error:", error);
        return {
            error: NextResponse.json(
                { message: "Authentication failed" },
                { status: 500 }
            )
        };
    }
}