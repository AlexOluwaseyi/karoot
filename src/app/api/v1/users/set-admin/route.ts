import ErrorHandler from "@/app/lib/ErrorHandler";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { z } from "zod";
import { authenticateRequest } from "@/app/lib/auth/cookieAuth";

const SetAdmin = z.object({
    username: z.string(),
    isAdmin: z.boolean(),
});

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        // Authenticate the request
        const auth = await authenticateRequest(true);
        if (auth.error) {
            return auth.error
        }

        /** Refactor cookie authentication
         * 
        const cookieStore = await cookies(); // Access cookies
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const currentUser = verifyToken(accessToken, "access");
        if (!currentUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const adminRecord = await prisma.user.findUnique({ where: { userId: currentUser.userId } });
        if (!adminRecord) {
            return NextResponse.json({ message: "User not found." }, { status: 401 });
        }
        if (!adminRecord.isAdmin) {
            return NextResponse.json({ message: "Only administrators can change admin privileges" }, { status: 403 });
        } */

        const authUser = auth.user;
        if (!authUser) {
            return NextResponse.json({ message: "No authenticated user found." }, { status: 401 });
        }

        const body = await request.json();
        const { username, isAdmin } = SetAdmin.parse(body);

        if (authUser.username === username) {
            return NextResponse.json({ message: "You cannot change your own admin privileges" }, { status: 403 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { username: username },
        });
        if (!targetUser) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }
        if (targetUser.isAdmin === isAdmin) {
            return NextResponse.json({ message: `User is already ${isAdmin ? "an admin" : "not an admin"}.` }, { status: 200 });
        }
        if (targetUser.isAdmin && !isAdmin) {
            return NextResponse.json({ message: "You cannot demote an admin user." }, { status: 403 });
        }

        // Create audit log entry
        await prisma.auditLog.create({
            data: {
                action: `ADMIN_STATUS_CHANGE`,
                description: `Admin status of ${username} set to ${isAdmin}`,
                performedAt: new Date(),
                performerId: authUser.userId,
                targetId: targetUser.userId,
            }
        });

        const updatedUser = await prisma.user.update({
            where: { username: username },
            data: { isAdmin: isAdmin, updatedAt: new Date() },
            select: {
                userId: true,
                username: true,
                email: true,
                isAdmin: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ message: "User upgraded to admin successfully.", updatedUser }, { status: 200 });
    } catch (error) {
        const { status, message } = ErrorHandler(error);
        return NextResponse.json({ message: message }, { status });
    }
}
